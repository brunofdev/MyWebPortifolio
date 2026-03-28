import React, { useState, useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import "../../styles/articleeditor.css";

const lowlight = createLowlight(common);

// ─── Canvas API Image Compression ────────────────────────────────────────────
const compressImage = (file, maxWidth = 1200, quality = 0.82) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ({ target }) => {
      const img = new window.Image();
      img.src = target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
    };
  });

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, viewBox = "0 0 24 24" }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((path, i) => <path key={i} d={path} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const Icons = {
  H1: () => <span className="icon-text">H1</span>,
  H2: () => <span className="icon-text">H2</span>,
  H3: () => <span className="icon-text">H3</span>,
  H4: () => <span className="icon-text">H4</span>,
  Bold: () => <Icon d="M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z" />,
  Italic: () => <Icon d="M19 4h-9M14 20H5M15 4L9 20" />,
  Underline: () => (
    <Icon d={["M6 3v7a6 6 0 006 6 6 6 0 006-6V3", "M4 21h16"]} />
  ),
  Strike: () => (
    <Icon
      d={[
        "M17.3 12H6.7",
        "M10 7.7C10.4 6.7 11.4 6 12.7 6c2 0 3.3 1.3 3.3 3 0 .7-.2 1.3-.6 1.7",
        "M6.7 16.3c.5 1.3 1.8 2.1 3.4 2.1 2 0 3.6-1.3 3.6-3.1 0-.8-.3-1.5-.8-2",
      ]}
    />
  ),
  Code: () => (
    <Icon d={["M16 18l6-6-6-6", "M8 6L2 12l6 6"]} />
  ),
  AlignLeft: () => (
    <Icon d={["M17 10H3", "M21 6H3", "M21 14H3", "M17 18H3"]} />
  ),
  AlignCenter: () => (
    <Icon d={["M21 6H3", "M17 10H7", "M21 14H3", "M17 18H7"]} />
  ),
  AlignRight: () => (
    <Icon d={["M21 10H7", "M21 6H3", "M21 14H3", "M21 18H7"]} />
  ),
  AlignJustify: () => (
    <Icon d={["M21 10H3", "M21 6H3", "M21 14H3", "M21 18H3"]} />
  ),
  ListUl: () => (
    <Icon
      d={[
        "M8 6h13",
        "M8 12h13",
        "M8 18h13",
        "M3 6h.01",
        "M3 12h.01",
        "M3 18h.01",
      ]}
    />
  ),
  ListOl: () => (
    <Icon
      d={[
        "M10 6h11",
        "M10 12h11",
        "M10 18h11",
        "M4 6h1v4",
        "M4 10H3",
        "M3 14h2l-2 2h2",
      ]}
    />
  ),
  CheckSquare: () => (
    <Icon
      d={[
        "M9 11l3 3L22 4",
        "M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
      ]}
    />
  ),
  Quote: () => (
    <Icon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  ),
  Link: () => (
    <Icon
      d={[
        "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71",
        "M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
      ]}
    />
  ),
  Image: () => (
    <Icon
      d={[
        "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z",
        "M12 17a4 4 0 100-8 4 4 0 000 8z",
      ]}
    />
  ),
  ImageUrl: () => (
    <Icon
      d={[
        "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71",
        "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z",
      ]}
    />
  ),
  Minus: () => <Icon d="M5 12h14" />,
  Undo: () => <Icon d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />,
  Redo: () => <Icon d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />,
  Eye: () => (
    <Icon
      d={[
        "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z",
        "M12 9a3 3 0 100 6 3 3 0 000-6z",
      ]}
    />
  ),
  Edit: () => (
    <Icon
      d={[
        "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7",
        "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
      ]}
    />
  ),
  Upload: () => (
    <Icon
      d={[
        "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4",
        "M17 8l-5-5-5 5",
        "M12 3v12",
      ]}
    />
  ),
  X: () => <Icon d={["M18 6L6 18", "M6 6l12 12"]} />,
  Tag: () => (
    <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />
  ),
  Send: () => (
    <Icon d={["M22 2L11 13", "M22 2L15 22 11 13 2 9l20-7z"]} />
  ),
  Globe: () => (
    <Icon
      d={[
        "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
        "M2 12h20",
        "M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
      ]}
    />
  ),
  Save: () => (
    <Icon
      d={[
        "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z",
        "M17 21v-8H7v8",
        "M7 3v5h8",
      ]}
    />
  ),
};

// ─── Link Modal ───────────────────────────────────────────────────────────────
const LinkModal = ({ onConfirm, onClose, initialUrl = "" }) => {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onConfirm(url);
    }
    if (e.key === "Escape") onClose();
  };
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Inserir Link</span>
          <button onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <input
          ref={inputRef}
          className="modal-input"
          type="url"
          placeholder="https://exemplo.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKey}
        />
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-confirm" onClick={() => onConfirm(url)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Image URL Modal ──────────────────────────────────────────────────────────
const ImageUrlModal = ({ onConfirm, onClose }) => {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Imagem por URL</span>
          <button onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <input
          ref={inputRef}
          className="modal-input"
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          className="modal-input"
          type="text"
          placeholder="Texto alternativo (alt)"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          style={{ marginTop: 8 }}
        />
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="modal-btn-confirm"
            onClick={() => onConfirm(url, alt)}
            disabled={!url}
          >
            Inserir
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const ToolBtn = ({ onClick, active, disabled, label, children, title }) => (
  <button
    type="button"
    className={`tool-btn${active ? " is-active" : ""}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={title || label}
  >
    {children}
  </button>
);

// ─── Toolbar ─────────────────────────────────────────────────────────────────
const Toolbar = React.memo(({ editor }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);

  if (!editor) return null;

  const insertImageFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const src = await compressImage(file);
      editor.chain().focus().setImage({ src }).run();
    };
    input.click();
  };

  const handleLinkConfirm = (url) => {
    setShowLinkModal(false);
    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageUrlConfirm = (src, alt) => {
    setShowImageUrlModal(false);
    if (src) editor.chain().focus().setImage({ src, alt }).run();
  };

  const groups = [
    [
      {
        label: "H1",
        title: "Título 1",
        action: () =>
          editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
        icon: <Icons.H1 />,
      },
      {
        label: "H2",
        title: "Título 2",
        action: () =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
        icon: <Icons.H2 />,
      },
      {
        label: "H3",
        title: "Título 3",
        action: () =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: editor.isActive("heading", { level: 3 }),
        icon: <Icons.H3 />,
      },
      {
        label: "H4",
        title: "Título 4",
        action: () =>
          editor.chain().focus().toggleHeading({ level: 4 }).run(),
        active: editor.isActive("heading", { level: 4 }),
        icon: <Icons.H4 />,
      },
    ],
    [
      {
        label: "Negrito",
        action: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive("bold"),
        icon: <Icons.Bold />,
      },
      {
        label: "Itálico",
        action: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive("italic"),
        icon: <Icons.Italic />,
      },
      {
        label: "Sublinhado",
        action: () => editor.chain().focus().toggleUnderline().run(),
        active: editor.isActive("underline"),
        icon: <Icons.Underline />,
      },
      {
        label: "Tachado",
        action: () => editor.chain().focus().toggleStrike().run(),
        active: editor.isActive("strike"),
        icon: <Icons.Strike />,
      },
      {
        label: "Código inline",
        action: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive("code"),
        icon: <Icons.Code />,
      },
    ],
    [
      {
        label: "Alinhar à esquerda",
        action: () => editor.chain().focus().setTextAlign("left").run(),
        active: editor.isActive({ textAlign: "left" }),
        icon: <Icons.AlignLeft />,
      },
      {
        label: "Centralizar",
        action: () => editor.chain().focus().setTextAlign("center").run(),
        active: editor.isActive({ textAlign: "center" }),
        icon: <Icons.AlignCenter />,
      },
      {
        label: "Alinhar à direita",
        action: () => editor.chain().focus().setTextAlign("right").run(),
        active: editor.isActive({ textAlign: "right" }),
        icon: <Icons.AlignRight />,
      },
      {
        label: "Justificar",
        action: () => editor.chain().focus().setTextAlign("justify").run(),
        active: editor.isActive({ textAlign: "justify" }),
        icon: <Icons.AlignJustify />,
      },
    ],
    [
      {
        label: "Lista não ordenada",
        action: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
        icon: <Icons.ListUl />,
      },
      {
        label: "Lista ordenada",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
        icon: <Icons.ListOl />,
      },
      {
        label: "Checklist",
        action: () => editor.chain().focus().toggleTaskList().run(),
        active: editor.isActive("taskList"),
        icon: <Icons.CheckSquare />,
      },
    ],
    [
      {
        label: "Citação",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        active: editor.isActive("blockquote"),
        icon: <Icons.Quote />,
      },
      {
        label: "Separador horizontal",
        action: () => editor.chain().focus().setHorizontalRule().run(),
        active: false,
        icon: <Icons.Minus />,
      },
      {
        label: "Bloco de código",
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        active: editor.isActive("codeBlock"),
        icon: <Icons.Code />,
      },
    ],
    [
      {
        label: "Link",
        action: () => setShowLinkModal(true),
        active: editor.isActive("link"),
        icon: <Icons.Link />,
      },
      {
        label: "Imagem (upload)",
        action: insertImageFile,
        active: false,
        icon: <Icons.Image />,
      },
      {
        label: "Imagem (URL)",
        action: () => setShowImageUrlModal(true),
        active: false,
        icon: <Icons.ImageUrl />,
      },
    ],
    [
      {
        label: "Desfazer",
        action: () => editor.chain().focus().undo().run(),
        active: false,
        disabled: !editor.can().undo(),
        icon: <Icons.Undo />,
      },
      {
        label: "Refazer",
        action: () => editor.chain().focus().redo().run(),
        active: false,
        disabled: !editor.can().redo(),
        icon: <Icons.Redo />,
      },
    ],
  ];

  return (
    <>
      <div
        className="ae-toolbar"
        role="toolbar"
        aria-label="Ferramentas de formatação"
      >
        {groups.map((group, gi) => (
          <div key={gi} className="ae-toolbar__group">
            {group.map((btn) => (
              <ToolBtn
                key={btn.label}
                onClick={btn.action}
                active={btn.active}
                disabled={btn.disabled}
                label={btn.label}
                title={btn.title}
              >
                {btn.icon}
              </ToolBtn>
            ))}
          </div>
        ))}
      </div>
      {showLinkModal && (
        <LinkModal
          onConfirm={handleLinkConfirm}
          onClose={() => setShowLinkModal(false)}
          initialUrl={editor.getAttributes("link").href || ""}
        />
      )}
      {showImageUrlModal && (
        <ImageUrlModal
          onConfirm={handleImageUrlConfirm}
          onClose={() => setShowImageUrlModal(false)}
        />
      )}
    </>
  );
});

// ─── Slug Generator ───────────────────────────────────────────────────────────
const toSlug = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ─── Save Status Indicator ────────────────────────────────────────────────────
const SaveIndicator = ({ status }) => {
  const map = {
    idle: { label: "Salvo", cls: "saved" },
    saving: { label: "Salvando…", cls: "saving" },
    error: { label: "Erro ao salvar", cls: "error" },
  };
  const { label, cls } = map[status] || map.idle;
  return (
    <span className={`ae-save-status ae-save-status--${cls}`}>{label}</span>
  );
};

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput = ({ tags, onChange }) => {
  const [value, setValue] = useState("");
  const add = (e) => {
    if ((e.key === "Enter" || e.key === ",") && value.trim()) {
      e.preventDefault();
      const tag = value.trim().replace(/,$/, "");
      if (tag && !tags.includes(tag)) onChange([...tags, tag]);
      setValue("");
    }
  };
  const remove = (t) => onChange(tags.filter((x) => x !== t));
  return (
    <div className="ae-tag-input">
      {tags.map((t) => (
        <span key={t} className="ae-tag-chip">
          <Icons.Tag />
          {t}
          <button
            type="button"
            onClick={() => remove(t)}
            aria-label={`Remover tag ${t}`}
          >
            <Icons.X />
          </button>
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={add}
        placeholder={
          tags.length === 0 ? "Adicionar tag e pressionar Enter…" : "+"
        }
        aria-label="Nova tag"
      />
    </div>
  );
};

// ─── Cover Upload ─────────────────────────────────────────────────────────────
const CoverUpload = ({ src, onChange, onUpload }) => {
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (onUpload) {
      const url = await onUpload(file);
      onChange(url);
      return;
    }
    const compressed = await compressImage(file, 1600, 0.88);
    onChange(compressed);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (onUpload) {
      const url = await onUpload(file);
      onChange(url);
      return;
    }
    const compressed = await compressImage(file, 1600, 0.88);
    onChange(compressed);
  };

  if (src) {
    return (
      <div className="ae-cover-preview">
        <img src={src} alt="Capa do artigo" />
        <button
          type="button"
          className="ae-cover-remove"
          onClick={() => onChange("")}
        >
          <Icons.X /> Remover capa
        </button>
      </div>
    );
  }
  return (
    <label
      className="ae-cover-dropzone"
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add("drag-over");
      }}
      onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
    >
      <Icons.Upload size={28} />
      <span>
        Arraste a imagem de capa aqui ou <u>clique para selecionar</u>
      </span>
      <small>JPEG, PNG, WebP — recomendado 1600 × 900px</small>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </label>
  );
};

// ─── Preview ──────────────────────────────────────────────────────────────────
const PreviewPane = ({ formData, content, onBack }) => (
  <div className="ae-preview">
    <div className="ae-preview__bar">
      <span className="ae-preview__label">Pré-visualização</span>
      <button className="ae-preview__back" onClick={onBack}>
        <Icons.Edit /> Voltar à edição
      </button>
    </div>
    <article className="ae-preview__article">
      {formData.coverImage && (
        <img
          className="ae-preview__cover"
          src={formData.coverImage}
          alt="Capa"
        />
      )}
      <header className="ae-preview__header">
        {formData.tags.length > 0 && (
          <div className="ae-preview__tags">
            {formData.tags.map((t) => (
              <span key={t} className="ae-preview__tag">
                {t}
              </span>
            ))}
          </div>
        )}
        <h1 className="ae-preview__title">
          {formData.title || <em>Sem título</em>}
        </h1>
        {formData.subtitle && (
          <p className="ae-preview__subtitle">{formData.subtitle}</p>
        )}
        <div className="ae-preview__meta">
          {formData.slug && (
            <span className="ae-preview__slug">/{formData.slug}</span>
          )}
          <span
            className={`ae-preview__status ae-status--${formData.status.toLowerCase()}`}
          >
            {formData.status}
          </span>
        </div>
      </header>
      <div
        className="ae-preview__body editorial-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ArticleEditor = ({
  initialData = {},
  onSave,
  onPublish,
  onCancel,
  uploadImage,
  autoSaveInterval = 5000, // increased from 3s to 5s
}) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    subtitle: initialData.subtitle || "",
    slug: initialData.slug || "",
    tags: initialData.tags || [],
    coverImage: initialData.coverImage || "",
    status: initialData.status || "Rascunho",
  });
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  // Refs to avoid stale closures without triggering re-renders
  const saveTimerRef = useRef(null);
  const formDataRef = useRef(formData);
  const isMountedRef = useRef(false);

  // Keep ref in sync with state, but don't trigger autosave from here
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "justify",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Comece a escrever seu artigo aqui…",
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialData.content || "",
    // PERFORMANCE: only schedule autosave on editor changes, not on every keystroke
    onUpdate: () => {
      if (isMountedRef.current) {
        scheduleAutoSave();
      }
    },
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  const buildPayload = useCallback(() => ({
    ...formDataRef.current,
    content: editor?.getHTML() ?? "",
    updatedAt: new Date().toISOString(),
  }), [editor]);

  // PERFORMANCE: single debounced autosave — only from editor changes
  // formData changes (title, slug, tags) do NOT trigger autosave automatically;
  // they are included via ref when the editor-debounce fires or on manual save.
  const scheduleAutoSave = useCallback(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      try {
        if (onSave) await onSave(buildPayload());
        setSaveStatus("idle");
      } catch {
        setSaveStatus("error");
      }
    }, autoSaveInterval);
  }, [buildPayload, onSave, autoSaveInterval]);

  // Manual save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        clearTimeout(saveTimerRef.current);
        setSaveStatus("saving");
        try {
          if (onSave) await onSave(buildPayload());
          setSaveStatus("idle");
        } catch {
          setSaveStatus("error");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buildPayload, onSave]);

  const setField = useCallback(
    (field) => (value) =>
      setFormData((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleTitleChange = useCallback((e) => {
    const title = e.target.value;
    const slug = toSlug(title);
    setFormData((prev) => ({ ...prev, title, slug }));
  }, []);

  const handlePublish = async () => {
    const payload = { ...buildPayload(), status: "Publicado" };
    setFormData((prev) => ({ ...prev, status: "Publicado" }));
    if (onPublish) await onPublish(payload);
  };

  const handleManualSave = async () => {
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      if (onSave) await onSave(buildPayload());
      setSaveStatus("idle");
    } catch {
      setSaveStatus("error");
    }
  };

  return (
    <div className="ae-root">
      {/* ── Top Bar ── */}
      <div className="ae-topbar">
        <div className="ae-topbar__left">
          <span className="ae-topbar__title">
            {isPreview ? "Pré-visualização" : "Editor de Artigo"}
          </span>
        </div>
        <div className="ae-topbar__center">
          <SaveIndicator status={saveStatus} />
        </div>
        <div className="ae-topbar__right">
          {onCancel && (
            <button
              type="button"
              className="ae-btn ae-btn--ghost"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            className="ae-btn ae-btn--save"
            onClick={handleManualSave}
            title="Salvar (Ctrl+S)"
          >
            <Icons.Save /> Salvar
          </button>
          <button
            type="button"
            className="ae-btn ae-btn--secondary"
            onClick={() => setIsPreview((v) => !v)}
          >
            {isPreview ? (
              <>
                <Icons.Edit /> Editar
              </>
            ) : (
              <>
                <Icons.Eye /> Visualizar
              </>
            )}
          </button>
          <button
            type="button"
            className="ae-btn ae-btn--primary"
            onClick={handlePublish}
          >
            <Icons.Send /> Publicar
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {isPreview ? (
        <PreviewPane
          formData={formData}
          content={editor?.getHTML() ?? ""}
          onBack={() => setIsPreview(false)}
        />
      ) : (
        <div className="ae-editor-layout">
          {/* ── Left: Metadata ── */}
          <aside className="ae-sidebar">
            <section className="ae-card">
              <h3 className="ae-card__heading">Metadados</h3>

              <div className="ae-field">
                <label className="ae-label">Status</label>
                <select
                  className="ae-select"
                  value={formData.status}
                  onChange={(e) => setField("status")(e.target.value)}
                >
                  <option>Rascunho</option>
                  <option>Agendado</option>
                  <option>Publicado</option>
                </select>
              </div>

              <div className="ae-field">
                <label className="ae-label">Slug (URL)</label>
                <div className="ae-slug-field">
                  <span className="ae-slug-prefix">
                    <Icons.Globe />
                  </span>
                  <input
                    className="ae-input"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setField("slug")(e.target.value)}
                    placeholder="meu-artigo"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="ae-field">
                <label className="ae-label">Tags</label>
                <TagInput tags={formData.tags} onChange={setField("tags")} />
              </div>

              <div className="ae-field">
                <label className="ae-label">Imagem de Capa</label>
                <CoverUpload
                  src={formData.coverImage}
                  onChange={setField("coverImage")}
                  onUpload={uploadImage}
                />
              </div>
            </section>
          </aside>

          {/* ── Right: Editor ── */}
          <main className="ae-main">
            <div className="ae-card ae-card--editor">
              <div className="ae-meta-inputs">
                <input
                  className="ae-title-input"
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Título do artigo"
                  aria-label="Título principal"
                />
                <input
                  className="ae-subtitle-input"
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setField("subtitle")(e.target.value)}
                  placeholder="Subtítulo ou chamada"
                  aria-label="Subtítulo"
                />
                <div className="ae-divider" />
              </div>

              <Toolbar editor={editor} />

              <div className="ae-editor-body editorial-content">
                <EditorContent editor={editor} />
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
