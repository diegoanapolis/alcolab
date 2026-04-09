'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface GalleryImage {
  name: string;
  url: string;
  size: number;
  modified: string;
}

interface FeaturedImageDialogProps {
  open: boolean;
  onClose: () => void;
  currentUrl: string;
  onSelect: (url: string) => void;
  onUpload: (file: File) => Promise<string | null>;
}

export default function FeaturedImageDialog({
  open,
  onClose,
  currentUrl,
  onSelect,
  onUpload,
}: FeaturedImageDialogProps) {
  const [tab, setTab] = useState<'upload' | 'gallery'>('upload');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(currentUrl || '');
      setError('');
      setUploading(false);
      setTab('upload');
    }
  }, [open, currentUrl]);

  useEffect(() => {
    if (open && tab === 'gallery' && gallery.length === 0) loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  async function loadGallery() {
    setLoadingGallery(true);
    try {
      const res = await fetch('/api/admin/images');
      if (res.ok) {
        const d = await res.json();
        setGallery(d.images || []);
      }
    } catch {
      /* ignore */
    }
    setLoadingGallery(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        setUrl(uploadedUrl);
        loadGallery();
      } else {
        setError('Falha no upload.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload.');
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[85vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Selecionar imagem de destaque
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 px-4">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-3 pb-2 pt-2 text-sm font-medium border-b-2 transition ${
              tab === 'upload'
                ? 'border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            Upload / URL
          </button>
          <button
            type="button"
            onClick={() => setTab('gallery')}
            className={`px-3 pb-2 pt-2 text-sm font-medium border-b-2 transition ${
              tab === 'gallery'
                ? 'border-blue-700 text-blue-700 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            Galeria
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto flex-1 space-y-3">
          {tab === 'upload' && (
            <>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  URL da imagem
                </label>
                <div className="flex gap-1.5 mt-1">
                  <input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                    placeholder="Cole uma URL ou faça upload"
                    className="flex-1 border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded text-xs inline-flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 text-gray-700 dark:text-gray-200"
                    disabled={uploading}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Enviando...' : 'Upload'}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {url && (
                <div className="border border-gray-200 dark:border-slate-700 rounded p-2 bg-gray-50 dark:bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded"
                    onError={() => setError('Imagem não encontrada.')}
                  />
                </div>
              )}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-2 py-1.5">
                  {error}
                </p>
              )}
            </>
          )}

          {tab === 'gallery' && (
            <>
              {loadingGallery ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Carregando...
                </p>
              ) : gallery.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Nenhuma imagem na galeria.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((img) => (
                    <button
                      type="button"
                      key={img.name}
                      onClick={() => {
                        setUrl(img.url);
                        setTab('upload');
                      }}
                      className={`relative group border rounded-lg overflow-hidden bg-gray-50 dark:bg-slate-900 cursor-pointer text-left ${
                        url === img.url
                          ? 'border-blue-700 ring-2 ring-blue-500'
                          : 'border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-24 object-cover hover:opacity-80 transition"
                      />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 px-1 py-0.5 truncate">
                        {img.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={loadGallery}
                className="text-xs text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Atualizar galeria
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (url) {
                onSelect(url);
                onClose();
              }
            }}
            disabled={!url || uploading}
            className="px-3 py-1.5 text-sm rounded bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 inline-flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Usar esta imagem
          </button>
        </div>
      </div>
    </div>
  );
}