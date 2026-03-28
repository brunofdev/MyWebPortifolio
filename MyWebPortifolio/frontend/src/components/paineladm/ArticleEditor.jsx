/**
 * ArticleEditor — Performance-optimized + Color Picker
 *
 * Requires (npm):
 *   @tiptap/react @tiptap/starter-kit @tiptap/extension-image
 *   @tiptap/extension-text-align @tiptap/extension-underline
 *   @tiptap/extension-link @tiptap/extension-task-list
 *   @tiptap/extension-task-item @tiptap/extension-placeholder
 *   @tiptap/extension-code-block-lowlight
 *   @tiptap/extension-text-style   ← NEW
 *   @tiptap/extension-color         ← NEW
 *   lowlight
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { TextStyle } from "@tiptap/extension-text-style"; // ✅ Agora sim!
import { Color } from "@tiptap/extension-color";         // ✅ Mantém assim
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
  <svg width={size} height={size} viewBox={viewBox} fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const Icons = {
  H1: () => <span className="icon-text">H1</span>,
  H2: () => <span className="icon-text">H2</span>,
  H3: () => <span className="icon-text">H3</span>,
  H4: () => <span className="icon-text">H4</span>,
  Bold:        () => <Icon d="M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z" />,
  Italic:      () => <Icon d="M19 4h-9M14 20H5M15 4L9 20" />,
  Underline:   () => <Icon d={["M6 3v7a6 6 0 006 6 6 6 0 006-6V3","M4 21h16"]} />,
  Strike:      () => <Icon d={["M17.3 12H6.7","M10 7.7C10.4 6.7 11.4 6 12.7 6c2 0 3.3 1.3 3.3 3 0 .7-.2 1.3-.6 1.7","M6.7 16.3c.5 1.3 1.8 2.1 3.4 2.1 2 0 3.6-1.3 3.6-3.1 0-.8-.3-1.5-.8-2"]} />,
  Code:        () => <Icon d={["M16 18l6-6-6-6","M8 6L2 12l6 6"]} />,
  AlignLeft:   () => <Icon d={["M17 10H3","M21 6H3","M21 14H3","M17 18H3"]} />,
  AlignCenter: () => <Icon d={["M21 6H3","M17 10H7","M21 14H3","M17 18H7"]} />,
  AlignRight:  () => <Icon d={["M21 10H7","M21 6H3","M21 14H3","M21 18H7"]} />,
  AlignJustify:() => <Icon d={["M21 10H3","M21 6H3","M21 14H3","M21 18H3"]} />,
  ListUl:      () => <Icon d={["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"]} />,
  ListOl:      () => <Icon d={["M10 6h11","M10 12h11","M10 18h11","M4 6h1v4","M4 10H3","M3 14h2l-2 2h2"]} />,
  CheckSquare: () => <Icon d={["M9 11l3 3L22 4","M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"]} />,
  Quote:       () => <Icon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />,
  Link:        () => <Icon d={["M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71","M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"]} />,
  Image:       () => <Icon d={["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z","M12 17a4 4 0 100-8 4 4 0 000 8z"]} />,
  ImageUrl:    () => <Icon d={["M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71","M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"]} />,
  Minus:       () => <Icon d="M5 12h14" />,
  Undo:        () => <Icon d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />,
  Redo:        () => <Icon d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />,
  Eye:         () => <Icon d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"]} />,
  Edit:        () => <Icon d={["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"]} />,
  Upload:      () => <Icon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />,
  X:           () => <Icon d={["M18 6L6 18","M6 6l12 12"]} />,
  Tag:         () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />,
  Send:        () => <Icon d={["M22 2L11 13","M22 2L15 22 11 13 2 9l20-7z"]} />,
  Globe:       () => <Icon d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M2 12h20","M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"]} />,
  Save:        () => <Icon d={["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8","M7 3v5h8"]} />,
  Eraser:      () => <Icon d={["M20 20H7L3 16l10-10 7 7-3.5 3.5","M6.5 17.5l5-5"]} />,
};

// ─── Color palette ───────────────────────────────────────────────────────────
const PRESET_COLORS = [
  "#ffffff","#e0e0e0","#9e9e9e","#616161","#212121",
  "#ffcdd2","#ef9a9a","#e57373","#f44336","#b71c1c",
  "#ffe0b2","#ffcc80","#ffa726","#ef6c00","#bf360c",
  "#fff9c4","#fff176","#ffee58","#f9a825","#f57f17",
  "#c8e6c9","#a5d6a7","#66bb6a","#2e7d32","#1b5e20",
  "#b2dfdb","#80cbc4","#26a69a","#00695c","#004d40",
  "#bbdefb","#90caf9","#42a5f5","#1565c0","#0d47a1",
  "#ce93d8","#ab47bc","#7b1fa2","#4a148c","#e040fb",
  "#f8bbd9","#f48fb1","#f06292","#c2185b","#880e4f",
  "#80deea","#00e5ff","#00b0ff","#6200ea","#000000",
];

// ─── Color Picker ─────────────────────────────────────────────────────────────
const ColorPicker = React.memo(({ currentColor, onColor, onRemove, onClose }) => {
  const ref = useRef(null);
  const [custom, setCustom] = useState(currentColor || "#4caf50");

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handleOutside), 60);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handleOutside); };
  }, [onClose]);

  return (
    <div className="ae-color-picker" ref={ref}>
      <div className="ae-color-picker__header">
        <span className="ae-color-picker__title">Cor do texto</span>
        <button className="ae-color-picker__remove" onClick={onRemove} title="Remover cor">
          <Icons.Eraser /> Limpar
        </button>
      </div>

      <div className="ae-color-picker__swatches">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            className={`ae-swatch${currentColor === c ? " is-active" : ""}`}
            style={{ background: c }}
            onClick={() => { onColor(c); }}
            title={c}
            aria-label={`Cor ${c}`}
          />
        ))}
      </div>

      <div className="ae-color-picker__custom">
        <span className="ae-color-picker__custom-label">Cor personalizada</span>
        <div className="ae-color-picker__custom-row">
          <input
            type="color"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="ae-color-native"
          />
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="ae-color-hex"
            placeholder="#000000"
            maxLength={7}
            spellCheck={false}
          />
          <button className="ae-color-apply" onClick={() => onColor(custom)}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── Modals ───────────────────────────────────────────────────────────────────
const LinkModal = ({ onConfirm, onClose, initialUrl = "" }) => {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Inserir Link</span>
          <button onClick={onClose}><Icons.X /></button>
        </div>
        <input ref={inputRef} className="modal-input" type="url"
          placeholder="https://exemplo.com" value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onConfirm(url); } if (e.key === "Escape") onClose(); }} />
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn-confirm" onClick={() => onConfirm(url)}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

const ImageUrlModal = ({ onConfirm, onClose }) => {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>Imagem por URL</span>
          <button onClick={onClose}><Icons.X /></button>
        </div>
        <input ref={inputRef} className="modal-input" type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={url} onChange={(e) => setUrl(e.target.value)} />
        <input className="modal-input" type="text" placeholder="Texto alternativo (alt)"
          value={alt} onChange={(e) => setAlt(e.target.value)} style={{ marginTop: 8 }} />
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn-confirm" onClick={() => onConfirm(url, alt)} disabled={!url}>Inserir</button>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar Button ───────────────────────────────────────────────────────────
const ToolBtn = React.memo(({ onClick, active, disabled, label, children, title }) => (
  <button type="button"
    className={`tool-btn${active ? " is-active" : ""}`}
    onClick={onClick} disabled={disabled}
    aria-label={label} title={title || label}>
    {children}
  </button>
));

// ─── Color Toolbar Button ─────────────────────────────────────────────────────
const ColorBtn = React.memo(({ currentColor, onClick }) => (
  <button type="button" className="tool-btn tool-btn--color"
    onClick={onClick} aria-label="Cor do texto" title="Cor do texto">
    <span className="tool-btn__color-letter" style={{ color: currentColor || "var(--tool-icon)" }}>A</span>
    <span className="tool-btn__color-bar"
      style={{ background: currentColor || "transparent",
               border: currentColor ? "none" : "1px dashed rgba(255,255,255,0.2)" }} />
  </button>
));

// ─── TOOLBAR ─────────────────────────────────────────────────────────────────
// PERFORMANCE KEY:
//   useEditorState() computes a derived snapshot of editor state and only
//   triggers a re-render when the snapshot actually changes.
//   Without this, every single keystroke re-renders the whole Toolbar because
//   the editor instance reference updates. With this, Toolbar only re-renders
//   when bold/italic/color/etc. actually changes → near-zero overhead while typing.
const Toolbar = React.memo(({ editor }) => {
  const [showLinkModal, setShowLinkModal]         = useState(false);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [showColorPicker, setShowColorPicker]     = useState(false);

  const s = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor;
      if (!e) return null;
      return {
        bold:         e.isActive("bold"),
        italic:       e.isActive("italic"),
        underline:    e.isActive("underline"),
        strike:       e.isActive("strike"),
        code:         e.isActive("code"),
        codeBlock:    e.isActive("codeBlock"),
        blockquote:   e.isActive("blockquote"),
        bulletList:   e.isActive("bulletList"),
        orderedList:  e.isActive("orderedList"),
        taskList:     e.isActive("taskList"),
        link:         e.isActive("link"),
        h1:           e.isActive("heading", { level: 1 }),
        h2:           e.isActive("heading", { level: 2 }),
        h3:           e.isActive("heading", { level: 3 }),
        h4:           e.isActive("heading", { level: 4 }),
        alignLeft:    e.isActive({ textAlign: "left" }),
        alignCenter:  e.isActive({ textAlign: "center" }),
        alignRight:   e.isActive({ textAlign: "right" }),
        alignJustify: e.isActive({ textAlign: "justify" }),
        canUndo:      e.can().undo(),
        canRedo:      e.can().redo(),
        color:        e.getAttributes("textStyle").color ?? null,
      };
    },
  });

  if (!editor || !s) return null;

  const insertImageFile = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      editor.chain().focus().setImage({ src: await compressImage(file) }).run();
    };
    input.click();
  };

  const handleLinkConfirm = (url) => {
    setShowLinkModal(false);
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <>
      <div className="ae-toolbar" role="toolbar" aria-label="Ferramentas de formatação">

        {/* Headings */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={s.h1} label="H1" title="Título 1"><Icons.H1 /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={s.h2} label="H2" title="Título 2"><Icons.H2 /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={s.h3} label="H3" title="Título 3"><Icons.H3 /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={s.h4} label="H4" title="Título 4"><Icons.H4 /></ToolBtn>
        </div>

        {/* Inline marks */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={s.bold} label="Negrito"><Icons.Bold /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={s.italic} label="Itálico"><Icons.Italic /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={s.underline} label="Sublinhado"><Icons.Underline /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={s.strike} label="Tachado"><Icons.Strike /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={s.code} label="Código inline"><Icons.Code /></ToolBtn>
        </div>

        {/* Color picker */}
        <div className="ae-toolbar__group" style={{ position: "relative" }}>
          <ColorBtn currentColor={s.color} onClick={() => setShowColorPicker((v) => !v)} />
          {showColorPicker && (
            <ColorPicker
              currentColor={s.color}
              onColor={(c) => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
              onRemove={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>

        {/* Alignment */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={s.alignLeft} label="Esquerda"><Icons.AlignLeft /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={s.alignCenter} label="Centro"><Icons.AlignCenter /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={s.alignRight} label="Direita"><Icons.AlignRight /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={s.alignJustify} label="Justificar"><Icons.AlignJustify /></ToolBtn>
        </div>

        {/* Lists */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={s.bulletList} label="Lista"><Icons.ListUl /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={s.orderedList} label="Lista numerada"><Icons.ListOl /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={s.taskList} label="Checklist"><Icons.CheckSquare /></ToolBtn>
        </div>

        {/* Blocks */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={s.blockquote} label="Citação"><Icons.Quote /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} label="Separador"><Icons.Minus /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={s.codeBlock} label="Código"><Icons.Code /></ToolBtn>
        </div>

        {/* Insert */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => setShowLinkModal(true)} active={s.link} label="Link"><Icons.Link /></ToolBtn>
          <ToolBtn onClick={insertImageFile} active={false} label="Imagem upload"><Icons.Image /></ToolBtn>
          <ToolBtn onClick={() => setShowImageUrlModal(true)} active={false} label="Imagem URL"><Icons.ImageUrl /></ToolBtn>
        </div>

        {/* History */}
        <div className="ae-toolbar__group">
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} active={false} disabled={!s.canUndo} label="Desfazer"><Icons.Undo /></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} active={false} disabled={!s.canRedo} label="Refazer"><Icons.Redo /></ToolBtn>
        </div>

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
          onConfirm={(src, alt) => { setShowImageUrlModal(false); if (src) editor.chain().focus().setImage({ src, alt }).run(); }}
          onClose={() => setShowImageUrlModal(false)}
        />
      )}
    </>
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toSlug = (str) =>
  str.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const SaveIndicator = React.memo(({ status }) => {
  const map = { idle: { label: "Salvo", cls: "saved" }, saving: { label: "Salvando…", cls: "saving" }, error: { label: "Erro ao salvar", cls: "error" } };
  const { label, cls } = map[status] || map.idle;
  return <span className={`ae-save-status ae-save-status--${cls}`}>{label}</span>;
});

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput = React.memo(({ tags, onChange }) => {
  const [value, setValue] = useState("");
  const add = (e) => {
    if ((e.key === "Enter" || e.key === ",") && value.trim()) {
      e.preventDefault();
      const tag = value.trim().replace(/,$/, "");
      if (tag && !tags.includes(tag)) onChange([...tags, tag]);
      setValue("");
    }
  };
  return (
    <div className="ae-tag-input">
      {tags.map((t) => (
        <span key={t} className="ae-tag-chip">
          <Icons.Tag />{t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remover tag ${t}`}><Icons.X /></button>
        </span>
      ))}
      <input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={add}
        placeholder={tags.length === 0 ? "Adicionar tag e pressionar Enter…" : "+"} aria-label="Nova tag" />
    </div>
  );
});

// ─── Cover Upload ─────────────────────────────────────────────────────────────
const CoverUpload = React.memo(({ src, onChange, onUpload }) => {
  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (onUpload) { onChange(await onUpload(file)); return; }
    onChange(await compressImage(file, 1600, 0.88));
  };
  const handleDrop = async (e) => {
    e.preventDefault(); e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (onUpload) { onChange(await onUpload(file)); return; }
    onChange(await compressImage(file, 1600, 0.88));
  };
  if (src) return (
    <div className="ae-cover-preview">
      <img src={src} alt="Capa do artigo" />
      <button type="button" className="ae-cover-remove" onClick={() => onChange("")}><Icons.X /> Remover</button>
    </div>
  );
  return (
    <label className="ae-cover-dropzone"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
      onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}>
      <Icons.Upload size={28} />
      <span>Arraste aqui ou <u>clique para selecionar</u></span>
      <small>JPEG, PNG, WebP — recomendado 1600 × 900px</small>
      <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </label>
  );
});

// ─── Preview ──────────────────────────────────────────────────────────────────
const PreviewPane = React.memo(({ formData, content, onBack }) => (
  <div className="ae-preview">
    <div className="ae-preview__bar">
      <span className="ae-preview__label">Pré-visualização</span>
      <button className="ae-preview__back" onClick={onBack}><Icons.Edit /> Voltar à edição</button>
    </div>
    <article className="ae-preview__article">
      {formData.coverImage && <img className="ae-preview__cover" src={formData.coverImage} alt="Capa" />}
      <header className="ae-preview__header">
        {formData.tags.length > 0 && (
          <div className="ae-preview__tags">{formData.tags.map((t) => <span key={t} className="ae-preview__tag">{t}</span>)}</div>
        )}
        <h1 className="ae-preview__title">{formData.title || <em>Sem título</em>}</h1>
        {formData.subtitle && <p className="ae-preview__subtitle">{formData.subtitle}</p>}
        <div className="ae-preview__meta">
          {formData.slug && <span className="ae-preview__slug">/{formData.slug}</span>}
          <span className={`ae-preview__status ae-status--${formData.status.toLowerCase()}`}>{formData.status}</span>
        </div>
      </header>
      <div className="ae-preview__body editorial-content" dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  </div>
));

// ─── Main Component ───────────────────────────────────────────────────────────
const ArticleEditor = ({
  initialData = {},
  onSave,
  onPublish,
  onCancel,
  uploadImage,
  autoSaveInterval = 5000,
}) => {
  const [formData, setFormData] = useState({
    title:      initialData.title      || "",
    subtitle:   initialData.subtitle   || "",
    slug:       initialData.slug       || "",
    tags:       initialData.tags       || [],
    coverImage: initialData.coverImage || "",
    status:     initialData.status     || "Rascunho",
  });
  const [isPreview, setIsPreview]   = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  const saveTimerRef = useRef(null);
  const formDataRef  = useRef(formData);
  const editorRef    = useRef(null);
  const mountedRef   = useRef(false);

  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const buildPayload = useCallback(() => ({
    ...formDataRef.current,
    content:   editorRef.current?.getHTML() ?? "",
    updatedAt: new Date().toISOString(),
  }), []);

  const doSave = useCallback(async () => {
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      if (onSave) await onSave(buildPayload());
      if (mountedRef.current) setSaveStatus("idle");
    } catch {
      if (mountedRef.current) setSaveStatus("error");
    }
  }, [buildPayload, onSave]);

  // Autosave only triggered by editor content changes (not every formData change)
  const scheduleAutoSave = useCallback(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { if (mountedRef.current) doSave(); }, autoSaveInterval);
  }, [doSave, autoSaveInterval]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle,
      Color,
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"], defaultAlignment: "justify" }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Comece a escrever seu artigo aqui…" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialData.content || "",
    onUpdate: () => { if (mountedRef.current) scheduleAutoSave(); },
  });

  useEffect(() => { editorRef.current = editor; }, [editor]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; clearTimeout(saveTimerRef.current); };
  }, []);

  // Ctrl/Cmd+S
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); doSave(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doSave]);

  const setField = useCallback((field) => (value) => setFormData((prev) => ({ ...prev, [field]: value })), []);
  const handleTitleChange = useCallback((e) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title, slug: toSlug(title) }));
  }, []);

  const handlePublish = async () => {
    setFormData((prev) => ({ ...prev, status: "Publicado" }));
    if (onPublish) await onPublish({ ...buildPayload(), status: "Publicado" });
  };

  // Sidebar only re-renders when its own data changes (not on editor keystrokes)
  const sidebar = useMemo(() => (
    <aside className="ae-sidebar">
      <section className="ae-card">
        <h3 className="ae-card__heading">Metadados</h3>
        <div className="ae-field">
          <label className="ae-label">Status</label>
          <select className="ae-select" value={formData.status} onChange={(e) => setField("status")(e.target.value)}>
            <option>Rascunho</option><option>Agendado</option><option>Publicado</option>
          </select>
        </div>
        <div className="ae-field">
          <label className="ae-label">Slug (URL)</label>
          <div className="ae-slug-field">
            <span className="ae-slug-prefix"><Icons.Globe /></span>
            <input className="ae-input" type="text" value={formData.slug}
              onChange={(e) => setField("slug")(e.target.value)} placeholder="meu-artigo" spellCheck={false} />
          </div>
        </div>
        <div className="ae-field">
          <label className="ae-label">Tags</label>
          <TagInput tags={formData.tags} onChange={setField("tags")} />
        </div>
        <div className="ae-field">
          <label className="ae-label">Imagem de Capa</label>
          <CoverUpload src={formData.coverImage} onChange={setField("coverImage")} onUpload={uploadImage} />
        </div>
      </section>
    </aside>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [formData.status, formData.slug, formData.tags, formData.coverImage, uploadImage]);

  return (
    <div className="ae-root">
      <div className="ae-topbar">
        <div className="ae-topbar__left">
          <span className="ae-topbar__title">{isPreview ? "Pré-visualização" : "Editor de Artigo"}</span>
        </div>
        <div className="ae-topbar__center"><SaveIndicator status={saveStatus} /></div>
        <div className="ae-topbar__right">
          {onCancel && <button type="button" className="ae-btn ae-btn--ghost" onClick={onCancel}>Cancelar</button>}
          <button type="button" className="ae-btn ae-btn--save" onClick={doSave} title="Salvar (Ctrl+S)">
            <Icons.Save /> Salvar
          </button>
          <button type="button" className="ae-btn ae-btn--secondary" onClick={() => setIsPreview((v) => !v)}>
            {isPreview ? <><Icons.Edit /> Editar</> : <><Icons.Eye /> Visualizar</>}
          </button>
          <button type="button" className="ae-btn ae-btn--primary" onClick={handlePublish}>
            <Icons.Send /> Publicar
          </button>
        </div>
      </div>

      {isPreview ? (
        <PreviewPane formData={formData} content={editor?.getHTML() ?? ""} onBack={() => setIsPreview(false)} />
      ) : (
        <div className="ae-editor-layout">
          {sidebar}
          <main className="ae-main">
            <div className="ae-card ae-card--editor">
              <div className="ae-meta-inputs">
                <input className="ae-title-input" type="text" value={formData.title}
                  onChange={handleTitleChange} placeholder="Título do artigo" aria-label="Título" />
                <input className="ae-subtitle-input" type="text" value={formData.subtitle}
                  onChange={(e) => setField("subtitle")(e.target.value)}
                  placeholder="Subtítulo ou chamada" aria-label="Subtítulo" />
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
