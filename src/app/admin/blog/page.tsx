'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { ChevronDown, Search, Loader, CheckCircle, AlertCircle, LogOut, Lock } from 'lucide-react';

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
  });

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

  // Apply filters and sorting
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter((post) => {
      const matchesAuthor =
        filters.author === 'all' || post.author === filters.author;
      const matchesStatus =
        filters.status === 'all' || post.status === filters.status;
      const matchesSearch = post.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      return matchesAuthor && matchesStatus && matchesSearch;
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                          {expandedPost === post.slug && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-normal">
                              {post.description}
                            </p>
                          )}
                        </button>
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
    </div>
  );
}
