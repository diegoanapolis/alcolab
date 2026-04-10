'use client';

import { useState, useEffect, useMemo, FormEvent, useCallback } from 'react';
import { ChevronDown, Search, Loader, CheckCircle, AlertCircle, LogOut, Lock, Eye, X, FileText, ArrowLeft, Save, ImagePlus, Languages } from 'lucide-react';
import dynamic from 'next/dynamic';
import FeaturedImageDialog from '@/components/FeaturedImageDialog';

const RichEditor = dynamic(() => import('@/components/RichEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-8 text-center text-neutral-400 text-sm">
      Carregando editor...
    </div>
  ),
});

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado';
  published: boolean;
  locale: string;
  tags: string[];
}

interface FilterState {
  author: string;
  status: string;
  search: string;
  locale: string;
}

interface EditorState {
  slug: string;
  originalSlug: string;
  locale: string;
  title: string;
  description: string;
  author: string;
  image: string;
  imageAlt: string;
  tags: string;
  focusKeyword: string;
  content: string;
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado';
  date: string;
}

const AUTHORS = [
  'Diego Mendes de Souza',
  'Pedro Augusto de Oliveira Morais',
  'Romério Rodrigues dos Santos Silva',
];

const STATUSES = ['rascunho', 'em_revisao', 'aprovado', 'publicado'];

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em revisão',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  em_revisao: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  aprovado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  publicado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const WORKFLOW: Record<string, string[]> = {
  rascunho: ['em_revisao'],
  em_revisao: ['aprovado', 'rascunho'],
  aprovado: ['publicado', 'em_revisao'],
  publicado: ['aprovado'],
};

const WORKFLOW_LABELS: Record<string, Record<string, string>> = {
  rascunho: {
    em_revisao: 'Enviar para revisão',
  },
  em_revisao: {
    aprovado: 'Aprovar',
    rascunho: 'Voltar para rascunho',
  },
  aprovado: {
    publicado: 'Publicar',
    em_revisao: 'Voltar para revisão',
  },
  publicado: {
    aprovado: 'Despublicar',
  },
};

function formatAuthorName(author: string): string {
  const parts = author.trim().split(' ');
  if (parts.length === 0) return author;
  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1][0];
  return `${firstName} ${lastNameInitial}.`;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/* ───────────────────── Login Screen ───────────────────── */
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Senha incorreta.');
        return;
      }
      onSuccess();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin — AlcoLab Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Insira a senha de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
          />
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ───────────────────── Main Admin Page ───────────────────── */
export default function BlogAdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'author' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [filters, setFilters] = useState<FilterState>({
    author: 'all',
    status: 'all',
    search: '',
    locale: 'pt',
  });

  // Content preview state
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Full-screen editor state
  const [editorPost, setEditorPost] = useState<EditorState | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorSuccess, setEditorSuccess] = useState(false);
  const [featuredImageDialogOpen, setFeaturedImageDialogOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateMessage, setTranslateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check session on mount
  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  // Fetch posts after authentication
  useEffect(() => {
    if (!authenticated) return;
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/blog');
        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [authenticated]);

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthenticated(false);
  };

  const handlePreview = async (post: BlogPost) => {
    setPreviewPost(post);
    setPreviewLoading(true);
    setPreviewHtml('');
    try {
      const locale = post.locale.startsWith('pt') ? 'pt' : 'en';
      const response = await fetch(
        `/api/admin/blog?slug=${encodeURIComponent(post.slug)}&locale=${locale}`
      );
      if (!response.ok) throw new Error('Failed to load content');
      const data = await response.json();
      setPreviewHtml(data.html || '');
    } catch {
      setPreviewHtml('<p class="text-red-600">Erro ao carregar conteúdo.</p>');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewPost(null);
    setPreviewHtml('');
  };

  // Apply filters and sorting (must be before conditional returns to respect rules of hooks)
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      const matchesAuthor =
        filters.author === 'all' || post.author === filters.author;
      const matchesStatus =
        filters.status === 'all' || post.status === filters.status;
      const matchesSearch = post.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const postLocale = post.locale.startsWith('pt') ? 'pt' : 'en';
      const matchesLocale =
        filters.locale === 'all' || postLocale === filters.locale;
      return matchesAuthor && matchesStatus && matchesSearch && matchesLocale;
    });

    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'author') {
        compareValue = a.author.localeCompare(b.author);
      } else if (sortBy === 'status') {
        compareValue = STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [posts, filters, sortBy, sortOrder]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: posts.length,
      rascunho: posts.filter((p) => p.status === 'rascunho').length,
      em_revisao: posts.filter((p) => p.status === 'em_revisao').length,
      publicado: posts.filter((p) => p.status === 'publicado').length,
    };
  }, [posts]);

  // --- All useCallback hooks must be before conditional returns (rules of hooks) ---

  const openEditor = useCallback(async (post: BlogPost) => {
    setEditorLoading(true);
    setEditorSuccess(false);
    try {
      const locale = post.locale.startsWith('pt') ? 'pt' : 'en';
      const response = await fetch(
        `/api/admin/blog?slug=${encodeURIComponent(post.slug)}&locale=${locale}`
      );
      if (!response.ok) throw new Error('Failed to load post');
      const data = await response.json();
      setEditorPost({
        slug: post.slug,
        originalSlug: post.slug,
        locale: post.locale,
        title: data.title || post.title,
        description: data.description || post.description,
        author: data.author || post.author,
        image: data.image || '',
        imageAlt: data.imageAlt || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        focusKeyword: data.focusKeyword || '',
        content: data.content || '',
        status: data.status || post.status,
        date: data.date || post.date || '',
      });
    } catch {
      setError('Erro ao carregar post para edição.');
      setEditorLoading(false);
    } finally {
      setEditorLoading(false);
    }
  }, []);

  const closeEditor = useCallback(() => {
    setEditorPost(null);
    setEditorSuccess(false);
  }, []);

const handleEditorSave = useCallback(async () => {
    if (!editorPost) return;
    try {
      setEditorSaving(true);
      setError(null);
      const tagsArray = editorPost.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const slugChanged = editorPost.slug !== editorPost.originalSlug;
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: editorPost.locale,
          slug: editorPost.originalSlug,
          newSlug: slugChanged ? editorPost.slug : undefined,
          title: editorPost.title,
          description: editorPost.description,
          author: editorPost.author,
          image: editorPost.image,
          imageAlt: editorPost.imageAlt,
          tags: tagsArray,
          focusKeyword: editorPost.focusKeyword,
          date: editorPost.date,
          content: editorPost.content,
          status: editorPost.status,
        }),
      });

      if (!response.ok) throw new Error('Failed to save post');

      setEditorSuccess(true);
      setTimeout(() => setEditorSuccess(false), 3000);

      // Update posts list
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.slug === editorPost.originalSlug
            ? {
                ...p,
                slug: editorPost.slug,
                title: editorPost.title,
                description: editorPost.description,
                author: editorPost.author,
                status: editorPost.status,
                date: editorPost.date,
                tags: editorPost.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0),
              }
            : p
        )
      );

      // Update originalSlug after successful save so future saves use the new slug
      if (slugChanged) {
        setEditorPost((prev) =>
          prev ? { ...prev, originalSlug: editorPost.slug } : prev
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setEditorSaving(false);
    }
  }, [editorPost]);

  const handleEditorStatusChange = useCallback(async (newStatus: string) => {
    if (!editorPost) return;
    try {
      setEditorSaving(true);
      setError(null);

      const response = await fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: editorPost.locale,
          slug: editorPost.slug,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update post status');

      setEditorPost({
        ...editorPost,
        status: newStatus as typeof editorPost.status,
      });

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.slug === editorPost.slug
            ? { ...p, status: newStatus as typeof p.status }
            : p
        )
      );

      setEditorSuccess(true);
      setTimeout(() => setEditorSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setEditorSaving(false);
    }
  }, [editorPost]);

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    return data.url || null;
  }, []);

  const handleTranslateToEn = useCallback(async () => {
    if (!editorPost) return;
    if (!editorPost.locale.startsWith('pt')) {
      setTranslateMessage({ type: 'error', text: 'Tradução disponível apenas em posts PT.' });
      return;
    }

    // Save current edits first so the translator sees the latest content
    try {
      setTranslating(true);
      setTranslateMessage(null);

      const tagsArray = editorPost.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const saveRes = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: editorPost.locale,
          slug: editorPost.originalSlug,
          title: editorPost.title,
          description: editorPost.description,
          author: editorPost.author,
          image: editorPost.image,
          imageAlt: editorPost.imageAlt,
          tags: tagsArray,
          focusKeyword: editorPost.focusKeyword,
          date: editorPost.date,
          content: editorPost.content,
          status: editorPost.status,
        }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({}));
        throw new Error(err.error || 'Falha ao salvar PT antes de traduzir.');
      }

      const res = await fetch('/api/admin/translate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: editorPost.locale,
          slug: editorPost.originalSlug,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha na tradução.');
      }

      setTranslateMessage({
        type: 'success',
        text: data.message || `Tradução EN salva como rascunho em ${data.targetSlug}.`,
      });

      // Refresh the posts list so the new EN entry shows up
      try {
        const listRes = await fetch('/api/admin/blog');
        if (listRes.ok) {
          const listData = await listRes.json();
          setPosts(listData);
        }
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      setTranslateMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro desconhecido ao traduzir.',
      });
    } finally {
      setTranslating(false);
    }
  }, [editorPost]);

  // --- End of useCallback hooks ---

  // Show loading while checking session
  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!authenticated) {
    return <LoginScreen onSuccess={() => setAuthenticated(true)} />;
  }

  // Handle status change
  const handleStatusChange = async (
    post: BlogPost,
    newStatus: string
  ) => {
    try {
      setUpdating(post.slug);
      setError(null);

      const response = await fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale: post.locale,
          slug: post.slug,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.slug === post.slug ? { ...p, status: newStatus as typeof post.status } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(null);
    }
  };

  const handleSortClick = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gerenciamento de Blog — AlcoLab
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Total de {stats.total} post{stats.total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total de Posts
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Rascunhos
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.rascunho}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Em Revisão
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.em_revisao}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Publicados
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.publicado}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Locale Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idioma
              </label>
              <select
                value={filters.locale}
                onChange={(e) =>
                  setFilters({ ...filters, locale: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
                <option value="all">Todos</option>
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Autor
              </label>
              <select
                value={filters.author}
                onChange={(e) =>
                  setFilters({ ...filters, author: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os autores</option>
                {AUTHORS.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar por título
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Digite para buscar..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Counter */}
            <div className="flex items-end">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredAndSortedPosts.length}
                </span>{' '}
                de{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {posts.length}
                </span>{' '}
                posts
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
            <p className="text-gray-600 dark:text-gray-400">
              {posts.length === 0
                ? 'Nenhum post encontrado. Comece criando um novo post!'
                : 'Nenhum post corresponde aos filtros selecionados.'}
            </p>
          </div>
        )}

        {/* Blog Table */}
        {!loading && filteredAndSortedPosts.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition"
                      onClick={() => handleSortClick('date')}
                    >
                      <div className="flex items-center gap-2">
                        Título
                        {sortBy === 'date' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition"
                      onClick={() => handleSortClick('author')}
                    >
                      <div className="flex items-center gap-2">
                        Autor
                        {sortBy === 'author' && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Tags
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedPosts.map((post) => (
                    <tr
                      key={post.slug}
                      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                    >
                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[post.status]
                          }`}
                        >
                          {STATUS_LABELS[post.status]}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <div>
                          <button
                            onClick={() =>
                              setExpandedPost(
                                expandedPost === post.slug ? null : post.slug
                              )
                            }
                            className="text-left text-sm text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            <div className="flex items-center gap-2">
                              {post.title}
                              <ChevronDown
                                className={`w-4 h-4 transition-transform flex-shrink-0 ${
                                  expandedPost === post.slug ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>
                          {expandedPost === post.slug && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mb-2">
                                {post.description}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handlePreview(post)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver conteúdo completo
                                </button>
                                <button
                                  onClick={() => openEditor(post)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-lg transition"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Editar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatAuthorName(post.author)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(post.date)}
                      </td>

                      {/* Tags */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {WORKFLOW[post.status].map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() =>
                                handleStatusChange(post, nextStatus)
                              }
                              disabled={updating === post.slug}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${
                                updating === post.slug
                                  ? 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : nextStatus === 'publicado'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : nextStatus === 'aprovado'
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-gray-400 hover:bg-gray-500 text-white'
                              }`}
                            >
                              {updating === post.slug ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {WORKFLOW_LABELS[post.status][nextStatus]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Content Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={closePreview}
          />

          {/* Slide-over Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-3xl flex">
            <div className="relative w-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col">
              {/* Panel Header */}
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[previewPost.status]
                        }`}
                      >
                        {STATUS_LABELS[previewPost.status]}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(previewPost.date)}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {previewPost.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Por {previewPost.author}
                    </p>
                  </div>
                  <button
                    onClick={closePreview}
                    className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Workflow Actions inside panel */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {WORKFLOW[previewPost.status].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={async () => {
                        await handleStatusChange(previewPost, nextStatus);
                        setPreviewPost({
                          ...previewPost,
                          status: nextStatus as typeof previewPost.status,
                        });
                      }}
                      disabled={updating === previewPost.slug}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        updating === previewPost.slug
                          ? 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : nextStatus === 'publicado'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : nextStatus === 'aprovado'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : nextStatus === 'em_revisao'
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-gray-400 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {updating === previewPost.slug ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {WORKFLOW_LABELS[previewPost.status][nextStatus]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {previewLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <article
                    className="prose prose-sm sm:prose-base max-w-none
                      prose-headings:text-gray-900 dark:prose-headings:text-white
                      prose-p:text-gray-700 dark:prose-p:text-gray-300
                      prose-a:text-blue-600 dark:prose-a:text-blue-400
                      prose-strong:text-gray-900 dark:prose-strong:text-white
                      prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                      prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                      prose-li:text-gray-700 dark:prose-li:text-gray-300
                      prose-blockquote:border-blue-500 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                )}
              </div>

              {/* Panel Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{previewPost.slug}</span>
                    <span className="mx-1">·</span>
                    <span>{previewPost.locale}</span>
                  </div>
                  <button
                    onClick={closePreview}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Editor Modal */}
      {editorPost && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={closeEditor}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-slate-700 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {editorPost.title || '(Sem título)'}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    STATUS_COLORS[editorPost.status]
                  }`}
                >
                  {STATUS_LABELS[editorPost.status]}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {WORKFLOW[editorPost.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleEditorStatusChange(nextStatus)}
                    disabled={editorSaving}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      editorSaving
                        ? 'bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : nextStatus === 'publicado'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : nextStatus === 'aprovado'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : nextStatus === 'em_revisao'
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {editorSaving ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {WORKFLOW_LABELS[editorPost.status][nextStatus]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {editorPost.locale.startsWith('pt') && (
                  <button
                    onClick={handleTranslateToEn}
                    disabled={translating || editorSaving}
                    title="Salva o PT e gera/atualiza a versão EN via Claude API"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {translating ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4" />
                    )}
                    {translating ? 'Traduzindo...' : 'Atualizar versão EN'}
                  </button>
                )}
                <button
                  onClick={handleEditorSave}
                  disabled={editorSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {editorSaving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar alterações
                </button>
              </div>
            </div>

            {/* Success Message */}
            {editorSuccess && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Alterações salvas com sucesso!
              </div>
            )}

            {/* Translation Result Message */}
            {translateMessage && (
              <div
                className={`mt-3 flex items-start gap-2 text-sm px-3 py-2 rounded-lg ${
                  translateMessage.type === 'success'
                    ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20'
                    : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                {translateMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{translateMessage.text}</span>
                <button
                  type="button"
                  onClick={() => setTranslateMessage(null)}
                  className="flex-shrink-0 opacity-70 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex">
            {/* Left Sidebar - SEO Fields */}
            <div className="w-80 border-r border-gray-200 dark:border-slate-700 overflow-y-auto bg-gray-50 dark:bg-slate-800">
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Título SEO{' '}
                    <span className="text-xs text-gray-500">
                      ({editorPost.title.length}/60)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editorPost.title}
                    onChange={(e) =>
                      setEditorPost({ ...editorPost, title: e.target.value })
                    }
                    placeholder="Digite o título..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: 50-60 caracteres
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Meta Description{' '}
                    <span className="text-xs text-gray-500">
                      ({editorPost.description.length}/160)
                    </span>
                  </label>
                  <textarea
                    value={editorPost.description}
                    onChange={(e) =>
                      setEditorPost({
                        ...editorPost,
                        description: e.target.value,
                      })
                    }
                    placeholder="Digite a descrição para SEO..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Recomendado: 120-160 caracteres
                  </p>
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Autor
                  </label>
                  <select
                    value={editorPost.author}
                    onChange={(e) =>
                      setEditorPost({ ...editorPost, author: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {AUTHORS.map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Path */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Imagem de destaque
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={editorPost.image}
                      onChange={(e) =>
                        setEditorPost({ ...editorPost, image: e.target.value })
                      }
                      placeholder="/images/..."
                      className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImageDialogOpen(true)}
                      title="Upload ou selecionar da galeria"
                      className="shrink-0 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-slate-600 inline-flex items-center gap-1"
                    >
                      <ImagePlus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Thumbnail preview */}
                  {editorPost.image && (
                    <div
                      key={editorPost.image}
                      className="mt-2 relative border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editorPost.image}
                        alt={editorPost.imageAlt || 'Imagem de destaque'}
                        className="block w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditorPost({ ...editorPost, image: '' })
                        }
                        title="Remover imagem"
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Image Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Texto alternativo da imagem
                  </label>
                  <input
                    type="text"
                    value={editorPost.imageAlt}
                    onChange={(e) =>
                      setEditorPost({ ...editorPost, imageAlt: e.target.value })
                    }
                    placeholder="Descrição da imagem..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editorPost.tags}
                    onChange={(e) =>
                      setEditorPost({ ...editorPost, tags: e.target.value })
                    }
                    placeholder="tag1, tag2, tag3..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Separadas por vírgula
                  </p>
                </div>

                {/* Focus Keyword */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Palavra-chave ou expressão-chave
                  </label>
                  <input
                    type="text"
                    value={editorPost.focusKeyword}
                    onChange={(e) =>
                      setEditorPost({ ...editorPost, focusKeyword: e.target.value })
                    }
                    placeholder="ex.: metanol em bebidas"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {(() => {
                    const kw = editorPost.focusKeyword.trim().toLowerCase();
                    if (!kw) {
                      return (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Termo principal para SEO (usado em título, descrição e texto).
                        </p>
                      );
                    }
                    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const re = new RegExp(escaped, 'gi');
                    const inTitle = re.test(editorPost.title);
                    re.lastIndex = 0;
                    const inDesc = re.test(editorPost.description);
                    re.lastIndex = 0;
                    const matches = editorPost.content.match(re);
                    const count = matches ? matches.length : 0;
                    const words = editorPost.content.trim().split(/\s+/).filter(Boolean).length;
                    const density = words > 0 ? ((count * kw.split(/\s+/).length) / words) * 100 : 0;
                    return (
                      <div className="mt-2 space-y-1 text-xs">
                        <div className={inTitle ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {inTitle ? '✓' : '✗'} No título SEO
                        </div>
                        <div className={inDesc ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {inDesc ? '✓' : '✗'} Na meta description
                        </div>
                        <div className={count > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {count > 0 ? '✓' : '✗'} No conteúdo ({count}x, densidade ~{density.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  {/* Slug - Editable */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={editorPost.slug}
                      onChange={(e) => {
                        const normalized = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        setEditorPost({ ...editorPost, slug: normalized });
                      }}
                      placeholder="meu-post-sobre-metanol"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {editorPost.slug !== editorPost.originalSlug && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        Atenção: alterar o slug renomeará o arquivo e mudará a URL.
                      </p>
                    )}
                  </div>

                  {/* Locale - Read Only */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Locale (somente leitura)
                    </label>
                    <div className="px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {editorPost.locale}
                    </div>
                  </div>

                  {/* Date - Editable */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Data de publicação
                    </label>
                    <input
                      type="date"
                      value={editorPost.date || ''}
                      onChange={(e) =>
                        setEditorPost({ ...editorPost, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Area - Editor */}
            <div className="flex-1 min-h-0 flex flex-col">
              {/* Featured Image banner (visible preview for authors) */}
              {editorPost.image && (
                <div
                  key={`hero-${editorPost.image}`}
                  className="relative mx-4 mt-4 mb-2 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editorPost.image}
                    alt={editorPost.imageAlt || 'Imagem de destaque'}
                    className="block w-full max-h-64 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
                    Imagem de destaque
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeaturedImageDialogOpen(true)}
                    title="Trocar imagem de destaque"
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded inline-flex items-center gap-1"
                  >
                    <ImagePlus className="w-3 h-3" />
                    Trocar
                  </button>
                </div>
              )}
              <RichEditor
                content={editorPost.content}
                onChange={(md) => setEditorPost({ ...editorPost, content: md })}
                onUploadImage={handleImageUpload}
              />
            </div>
          </div>

          {/* Featured Image Picker Dialog */}
          <FeaturedImageDialog
            open={featuredImageDialogOpen}
            onClose={() => setFeaturedImageDialogOpen(false)}
            currentUrl={editorPost.image}
            onSelect={(url) =>
              setEditorPost({ ...editorPost, image: url })
            }
            onUpload={handleImageUpload}
          />
        </div>
      )}
    </div>
  );
}
