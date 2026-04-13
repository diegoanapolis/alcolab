"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

/* Custom Image extension that preserves the style attribute (needed for width %)
   AND serializes images with style as raw HTML so it survives the Markdown round-trip. */
const CustomImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("style"),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.style) return {};
          return { style: attributes.style as string };
        },
      },
    };
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const src = node.attrs.src || "";
          const alt = node.attrs.alt || "";
          const style = node.attrs.style || "";
          if (style) {
            // Output as raw HTML so the style survives markdown round-trip
            state.write(`<img src="${src}" alt="${alt}" style="${style}" />\n\n`);
          } else {
            // Default markdown image syntax
            state.write(`![${alt}](${src})\n\n`);
          }
        },
        parse: {
          // Handled by TipTap's parseHTML (reads <img> tags with style attr)
        },
      },
    };
  },
});
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Markdown } from "tiptap-markdown";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ─── */
interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
}

interface GalleryImage {
  name: string;
  url: string;
  size: number;
  modified: string;
}

/* ─── Toolbar button ─── */
function Btn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        active
          ? "bg-blue-700 text-white"
          : "text-neutral-600 hover:bg-neutral-100"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-neutral-200 mx-0.5" />;
}

/* ─── Image Dialog ─── */
function ImageDialog({
  open,
  onClose,
  onInsert,
  onUpload,
  editMode,
  editData,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string, width: string) => void;
  onUpload?: (file: File) => Promise<string | null>;
  editMode?: boolean;
  editData?: { src: string; alt: string; width: string };
}) {
  const [tab, setTab] = useState<"upload" | "gallery">("upload");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [width, setWidth] = useState("100");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    if (open) {
      if (editMode && editData) {
        setUrl(editData.src);
        setAlt(editData.alt);
        const wMatch = editData.width.match(/(\d+)/);
        setWidth(wMatch ? wMatch[1] : "100");
        setTab("upload");
      } else {
        setUrl("");
        setAlt("");
        setWidth("100");
        setTab("upload");
      }
      setError("");
      setUploading(false);
    }
  }, [open, editMode, editData]);

  useEffect(() => {
    if (open && tab === "gallery" && gallery.length === 0) loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  async function loadGallery() {
    setLoadingGallery(true);
    try {
      const res = await fetch("/api/admin/images");
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
    if (!file || !onUpload) return;
    setUploading(true);
    setError("");
    try {
      const uploadedUrl = await onUpload(file);
      if (uploadedUrl) {
        setUrl(uploadedUrl);
        loadGallery();
      } else setError("Falha no upload.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex border-b px-4 pt-3">
          <button
            onClick={() => setTab("upload")}
            className={`px-3 pb-2 text-sm font-medium border-b-2 transition ${
              tab === "upload"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-neutral-400"
            }`}
          >
            {editMode ? "Editar imagem" : "Upload / URL"}
          </button>
          {!editMode && (
            <button
              onClick={() => setTab("gallery")}
              className={`px-3 pb-2 text-sm font-medium border-b-2 transition ${
                tab === "gallery"
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-neutral-400"
              }`}
            >
              Galeria
            </button>
          )}
        </div>
        <div className="p-4 overflow-auto flex-1 space-y-3">
          {tab === "upload" && (
            <>
              <div>
                <label className="text-xs text-neutral-500">
                  URL da imagem
                </label>
                <div className="flex gap-1.5 mt-1">
                  <input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError("");
                    }}
                    placeholder="Cole uma URL ou faça upload"
                    className="flex-1 border rounded px-2 py-1.5 text-sm"
                  />
                  {onUpload && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 border rounded text-xs hover:bg-neutral-50 disabled:opacity-40"
                      disabled={uploading}
                    >
                      {uploading ? "Enviando..." : "Upload"}
                    </button>
                  )}
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
                <div className="border rounded p-2 bg-neutral-50">
                  <img
                    src={url}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded"
                    onError={() => setError("Imagem não encontrada.")}
                  />
                </div>
              )}
              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded px-2 py-1.5">
                  {error}
                </p>
              )}
              <div>
                <label className="text-xs text-neutral-500">
                  Texto alternativo (ALT)
                </label>
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Descrição da imagem"
                  className="w-full border rounded px-2 py-1.5 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Largura (%)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="range"
                    min="25"
                    max="100"
                    step="5"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="flex-1 accent-blue-700"
                  />
                  <span className="text-xs text-neutral-600 w-10 text-right">
                    {width}%
                  </span>
                </div>
              </div>
            </>
          )}
          {tab === "gallery" && (
            <>
              {loadingGallery ? (
                <p className="text-sm text-neutral-400 text-center py-8">
                  Carregando...
                </p>
              ) : gallery.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-8">
                  Nenhuma imagem na galeria.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((img) => (
                    <div
                      key={img.name}
                      className="relative group border rounded-lg overflow-hidden bg-neutral-50 cursor-pointer"
                      onClick={() => {
                        setUrl(img.url);
                        setTab("upload");
                      }}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-24 object-cover hover:opacity-80 transition"
                      />
                      <p className="text-[10px] text-neutral-500 px-1 py-0.5 truncate">
                        {img.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!loadingGallery && (
                <button
                  onClick={loadGallery}
                  className="text-xs text-blue-700 hover:underline"
                >
                  Atualizar galeria
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (url) {
                onInsert(url, alt, width);
                onClose();
              }
            }}
            disabled={!url || uploading}
            className="px-3 py-1.5 text-sm rounded bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40"
          >
            {editMode ? "Atualizar" : "Inserir"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Video Dialog ─── */
function VideoDialog({
  open,
  onClose,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (open) setUrl("");
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pt-4 pb-2 border-b">
          <h3 className="text-sm font-semibold text-blue-700">
            Inserir vídeo YouTube
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-neutral-500">URL do vídeo</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border rounded px-2 py-1.5 text-sm mt-1"
              autoFocus
            />
          </div>
          <p className="text-[10px] text-neutral-400">
            Suporta links do YouTube (youtube.com/watch, youtu.be)
          </p>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (url) {
                onInsert(url);
                onClose();
              }
            }}
            disabled={!url}
            className="px-3 py-1.5 text-sm rounded bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40"
          >
            Inserir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Editor ─── */
export default function RichEditor({
  content,
  onChange,
  onUploadImage,
}: RichEditorProps) {
  const initialContent = useRef(content);
  const suppressUpdate = useRef(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<{
    src: string;
    alt: string;
    width: string;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      CustomImage.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg" },
      }),
      Youtube.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-lg" },
        width: 640,
        height: 360,
      }),
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph", "blockquote"] }),
      Placeholder.configure({
        placeholder: "Comece a escrever o artigo...",
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: "blog-table" },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent.current,
    onUpdate: ({ editor: ed }) => {
      if (suppressUpdate.current) return;
      const md = (ed.storage as any).markdown.getMarkdown() as string;
      onChange(md);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[400px] px-4 py-3 focus:outline-none prose-headings:text-blue-800 prose-a:text-blue-700 prose-img:rounded-lg prose-img:mx-auto prose-img:cursor-pointer",
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "IMG") {
          const src = target.getAttribute("src") || "";
          const imgAlt = target.getAttribute("alt") || "";
          const style = target.getAttribute("style") || "";
          const wMatch = style.match(/max-width:\s*(\d+)%/);
          setEditingImage({
            src,
            alt: imgAlt,
            width: wMatch ? wMatch[1] : "100",
          });
          setImageDialogOpen(true);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentMd = (editor.storage as any).markdown?.getMarkdown() as string;
    if (content !== currentMd) {
      suppressUpdate.current = true;
      editor.commands.setContent(content);
      suppressUpdate.current = false;
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", prev || "https://");
    if (url === null) return;
    if (url === "")
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
  }, [editor]);

  const insertImage = useCallback(
    (url: string, alt: string, width: string) => {
      if (!editor) return;
      if (editingImage) {
        const { state } = editor;
        let imagePos = -1;
        state.doc.descendants((node, pos) => {
          if (
            node.type.name === "image" &&
            node.attrs.src === editingImage.src
          ) {
            imagePos = pos;
            return false;
          }
        });
        if (imagePos >= 0) {
          const w = parseInt(width);
          if (w < 100)
            editor
              .chain()
              .focus()
              .setNodeSelection(imagePos)
              .deleteSelection()
              .insertContent(
                `<img src="${url}" alt="${alt}" style="max-width:${w}%;margin:0 auto;display:block" />`
              )
              .run();
          else
            editor
              .chain()
              .focus()
              .setNodeSelection(imagePos)
              .deleteSelection()
              .setImage({ src: url, alt })
              .run();
        }
        setEditingImage(null);
        return;
      }
      const w = parseInt(width);
      if (w < 100)
        editor
          .chain()
          .focus()
          .insertContent(
            `<img src="${url}" alt="${alt}" style="max-width:${w}%;margin:0 auto;display:block" />`
          )
          .run();
      else editor.chain().focus().setImage({ src: url, alt }).run();
    },
    [editor, editingImage]
  );

  const addYoutube = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    },
    [editor]
  );

  const addTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const handleUpload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!onUploadImage) return null;
      return onUploadImage(file);
    },
    [onUploadImage]
  );

  if (!editor) return null;

  return (
    <>
      <ImageDialog
        open={imageDialogOpen}
        onClose={() => {
          setImageDialogOpen(false);
          setEditingImage(null);
        }}
        onInsert={insertImage}
        onUpload={onUploadImage ? handleUpload : undefined}
        editMode={!!editingImage}
        editData={editingImage || undefined}
      />
      <VideoDialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        onInsert={addYoutube}
      />

      <div className="border rounded-lg bg-white h-full min-h-0 flex flex-col">
        {/* Toolbar */}
        <div className="flex-shrink-0 flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b bg-neutral-50 z-10">
          <Btn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito"
          >
            <strong>B</strong>
          </Btn>
          <Btn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Itálico"
          >
            <em>I</em>
          </Btn>
          <Btn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Sublinhado"
          >
            <u>U</u>
          </Btn>
          <Btn
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Tachado"
          >
            <s>S</s>
          </Btn>
          <Btn
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Destaque"
          >
            HL
          </Btn>
          <Sep />
          <Btn
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="H2"
          >
            H2
          </Btn>
          <Btn
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="H3"
          >
            H3
          </Btn>
          <Btn
            active={editor.isActive("heading", { level: 4 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
            title="H4"
          >
            H4
          </Btn>
          <Sep />
          <Btn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista"
          >
            &#8226;
          </Btn>
          <Btn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numerada"
          >
            1.
          </Btn>
          <Btn
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citação"
          >
            &ldquo;
          </Btn>
          <Sep />
          <Btn
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Código"
          >
            {"</>"}
          </Btn>
          <Sep />
          <Btn
            onClick={addLink}
            active={editor.isActive("link")}
            title="Link"
          >
            Link
          </Btn>
          <Btn
            onClick={() => {
              setEditingImage(null);
              setImageDialogOpen(true);
            }}
            title="Imagem"
          >
            Img
          </Btn>
          <Btn onClick={() => setVideoDialogOpen(true)} title="YouTube">
            Video
          </Btn>
          <Btn onClick={addTable} title="Inserir tabela">
            Tabela
          </Btn>
          <Sep />
          {editor.isActive("table") && (
            <>
              <Btn
                onClick={() =>
                  editor.chain().focus().addColumnAfter().run()
                }
                title="+ Coluna"
              >
                +Col
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="+ Linha"
              >
                +Lin
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="- Coluna"
              >
                -Col
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="- Linha"
              >
                -Lin
              </Btn>
              <Btn
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Excluir tabela"
              >
                xTab
              </Btn>
              <Sep />
            </>
          )}
          <Btn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Linha horizontal"
          >
            &#8212;
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Desfazer"
          >
            &#8617;
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Refazer"
          >
            &#8618;
          </Btn>
        </div>
        {/* Editor content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
