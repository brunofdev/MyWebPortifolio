/**
 * ArticleEditor.jsx
 *
 * CORREÇÕES APLICADAS:
 *  FIX #1 — Negrito/itálico/sublinhado/tachado agora usam os comandos
 *            toggleBoldKeepColor / toggleItalicKeepColor / etc., que
 *            preservam a cor do textStyle após o toggle.
 *  FIX #2 — Toolbar sticky com top: 56px (altura da topbar).
 *  FIX #3 — CSS refatorado (ver articleeditor.css).
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { EditorContent, useEditorState } from "@tiptap/react";

import { useArticleEditor, EDITOR_FONTS, LINE_HEIGHT_OPTIONS } from "./useArticleEditor";
import "../../styles/articleeditor.css";

// ─── Paleta de cores ──────────────────────────────────────────────────────────

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

// ─── Ícones SVG ───────────────────────────────────────────────────────────────

const Icon = ({ d, size = 20 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
  >
    {[d].flat().map((path, i) => <path key={i} d={path} />)}
  </svg>
);

const Icons = {
  H1:           () => <span className="icon-text">H1</span>,
  H2:           () => <span className="icon-text">H2</span>,
  H3:           () => <span className="icon-text">H3</span>,
  H4:           () => <span className="icon-text">H4</span>,
  Bold:         () => <Icon d="M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z" />,
  Italic:       () => <Icon d="M19 4h-9M14 20H5M15 4L9 20" />,
  Underline:    () => <Icon d={["M6 3v7a6 6 0 006 6 6 6 0 006-6V3","M4 21h16"]} />,
  Strike:       () => <Icon d={["M17.3 12H6.7","M10 7.7C10.4 6.7 11.4 6 12.7 6c2 0 3.3 1.3 3.3 3 0 .7-.2 1.3-.6 1.7","M6.7 16.3c.5 1.3 1.8 2.1 3.4 2.1 2 0 3.6-1.3 3.6-3.1 0-.8-.3-1.5-.8-2"]} />,
  Code:         () => <Icon d={["M16 18l6-6-6-6","M8 6L2 12l6 6"]} />,
  AlignLeft:    () => <Icon d={["M17 10H3","M21 6H3","M21 14H3","M17 18H3"]} />,
  AlignCenter:  () => <Icon d={["M21 6H3","M17 10H7","M21 14H3","M17 18H7"]} />,
  AlignRight:   () => <Icon d={["M21 10H7","M21 6H3","M21 14H3","M21 18H7"]} />,
  AlignJustify: () => <Icon d={["M21 10H3","M21 6H3","M21 14H3","M21 18H3"]} />,
  ListUl:       () => <Icon d={["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"]} />,
  ListOl:       () => <Icon d={["M10 6h11","M10 12h11","M10 18h11","M4 6h1v4","M4 10H3","M3 14h2l-2 2h2"]} />,
  CheckSquare:  () => <Icon d={["M9 11l3 3L22 4","M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"]} />,
  Quote:        () => <Icon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />,
  Link:         () => <Icon d={["M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71","M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"]} />,
  Image:        () => <Icon d={["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z","M12 17a4 4 0 100-8 4 4 0 000 8z"]} />,
  Minus:        () => <Icon d="M5 12h14" />,
  Undo:         () => <Icon d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />,
  Redo:         () => <Icon d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />,
  Eye:          () => <Icon d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"]} />,
  Edit:         () => <Icon d={["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"]} />,
  Upload:       () => <Icon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />,
  X:            () => <Icon d={["M18 6L6 18","M6 6l12 12"]} />,
  Tag:          () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />,
  Send:         () => <Icon d={["M22 2L11 13","M22 2L15 22 11 13 2 9l20-7z"]} />,
  Globe:        () => <Icon d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M2 12h20","M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"]} />,
  Save:         () => <Icon d={["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8","M7 3v5h8"]} />,
  Eraser:       () => <Icon d={["M20 20H7L3 16l10-10 7 7-3.5 3.5","M6.5 17.5l5-5"]} />,
  Font:         () => <Icon d={["M4 7V4h16v3","M9 20h6","M12 4v16"]} />,
  ChevronDown:  () => <Icon d="M6 9l6 6 6-6" />,
  ChevronUp:    () => <Icon d="M18 15l-6-6-6 6" />,
  LineHeight:   () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18M3 19h18M8 9l-4 3 4 3M16 9l4 3-4 3" />
    </svg>
  ),
  Loader:       () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className="ae-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  Settings:     () => <Icon d={["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"]} />,
};

// ─── Componentes atômicos ─────────────────────────────────────────────────────

const ToolBtn = React.memo(({ onClick, active, disabled, label, title, children }) => (
  <button
    type="button"
    className={`tool-btn${active ? " is-active" : ""}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={title ?? label}
  >
    {children}
  </button>
));

const ColorBtn = React.memo(({ currentColor, onClick }) => (
  <button type="button" className="tool-btn tool-btn--color" onClick={onClick}
    aria-label="Cor do texto" title="Cor do texto">
    <span className="tool-btn__color-letter" style={{ color: currentColor ?? "var(--tool-icon)" }}>A</span>
    <span className="tool-btn__color-bar"
      style={{
        background: currentColor ?? "transparent",
        border: currentColor ? "none" : "1px dashed rgba(255,255,255,0.25)",
      }} />
  </button>
));

// ─── Color Picker ─────────────────────────────────────────────────────────────

const ColorPicker = React.memo(({ currentColor, onColor, onRemove, onClose }) => {
  const ref = React.useRef(null);
  const [custom, setCustom] = useState(currentColor ?? "#4caf50");

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 60);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [onClose]);

  return (
    <div className="ae-color-picker" ref={ref}>
      <div className="ae-color-picker__header">
        <span className="ae-color-picker__title">Cor do texto</span>
        <button className="ae-color-picker__remove" onClick={onRemove}>
          <Icons.Eraser /> Limpar
        </button>
      </div>
      <div className="ae-color-picker__swatches">
        {PRESET_COLORS.map((c) => (
          <button key={c}
            className={`ae-swatch${currentColor === c ? " is-active" : ""}`}
            style={{ background: c }}
            onClick={() => onColor(c)}
            title={c} aria-label={`Cor ${c}`}
          />
        ))}
      </div>
      <div className="ae-color-picker__custom">
        <span className="ae-color-picker__custom-label">Cor personalizada</span>
        <div className="ae-color-picker__custom-row">
          <input type="color" value={custom}
            onChange={(e) => setCustom(e.target.value)} className="ae-color-native" />
          <input type="text" value={custom} maxLength={7} spellCheck={false}
            onChange={(e) => setCustom(e.target.value)} className="ae-color-hex" placeholder="#000000" />
          <button className="ae-color-apply" onClick={() => onColor(custom)}>Aplicar</button>
        </div>
      </div>
    </div>
  );
});

// ─── Font Picker ──────────────────────────────────────────────────────────────

const FontPicker = React.memo(({ currentFont, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 60);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, []);

  const current = EDITOR_FONTS.find((f) => f.value === currentFont) ?? EDITOR_FONTS[0];

  return (
    <div className="ae-font-picker" ref={ref}>
      <button type="button" className="ae-font-trigger" onClick={() => setOpen((v) => !v)}
        title="Fonte do texto">
        <Icons.Font />
        <span className="ae-font-trigger__label" style={{ fontFamily: current.value }}>
          {current.label}
        </span>
        <Icons.ChevronDown />
      </button>
      {open && (
        <div className="ae-font-dropdown">
          {EDITOR_FONTS.map((font) => (
            <button key={font.value} type="button"
              className={`ae-font-option${currentFont === font.value ? " is-active" : ""}`}
              onClick={() => { onChange(font.value); setOpen(false); }}
              style={{ fontFamily: font.value }}>
              <span className="ae-font-option__name">{font.label}</span>
              <span className="ae-font-option__category">{font.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Line Height Picker ───────────────────────────────────────────────────────

const LineHeightPicker = React.memo(({ currentLineHeight, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 60);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, []);

  const current = LINE_HEIGHT_OPTIONS.find((o) => o.value === currentLineHeight) ?? LINE_HEIGHT_OPTIONS[1];

  return (
    <div className="ae-font-picker" ref={ref} style={{ minWidth: 0 }}>
      <button
        type="button"
        className="ae-font-trigger ae-lh-trigger"
        onClick={() => setOpen((v) => !v)}
        title="Espaçamento entre linhas"
      >
        <Icons.LineHeight />
        <span className="ae-font-trigger__label" style={{ fontFamily: "inherit", minWidth: 70 }}>
          {current.label}
        </span>
        <Icons.ChevronDown />
      </button>
      {open && (
        <div className="ae-font-dropdown ae-lh-dropdown">
          {LINE_HEIGHT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`ae-font-option${currentLineHeight === opt.value ? " is-active" : ""}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="ae-font-option__name">{opt.label}</span>
              <span className="ae-font-option__category">{opt.value}×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Modais ───────────────────────────────────────────────────────────────────

const LinkModal = ({ onConfirm, onClose, initialUrl = "" }) => {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

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
          onKeyDown={(e) => {
            if (e.key === "Enter")  { e.preventDefault(); onConfirm(url); }
            if (e.key === "Escape") onClose();
          }} />
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
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

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
        <input className="modal-input" type="text"
          placeholder="Texto alternativo (alt)"
          value={alt} onChange={(e) => setAlt(e.target.value)}
          style={{ marginTop: 8 }} />
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn-confirm" disabled={!url}
            onClick={() => onConfirm(url, alt)}>Inserir</button>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const Toolbar = React.memo(({
  editor,
  currentFont,
  onFontChange,
  onEditorImageUpload,
  onSetFigureAlign,
  onSetLineHeight,
}) => {
  const [showLinkModal,     setShowLinkModal]     = useState(false);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [showColorPicker,   setShowColorPicker]   = useState(false);

  const s = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor;
      if (!e) return null;
      return {
        bold:          e.isActive("bold"),
        italic:        e.isActive("italic"),
        underline:     e.isActive("underline"),
        strike:        e.isActive("strike"),
        code:          e.isActive("code"),
        codeBlock:     e.isActive("codeBlock"),
        blockquote:    e.isActive("blockquote"),
        bulletList:    e.isActive("bulletList"),
        orderedList:   e.isActive("orderedList"),
        taskList:      e.isActive("taskList"),
        link:          e.isActive("link"),
        h1:            e.isActive("heading", { level: 1 }),
        h2:            e.isActive("heading", { level: 2 }),
        h3:            e.isActive("heading", { level: 3 }),
        h4:            e.isActive("heading", { level: 4 }),
        alignLeft:     e.isActive({ textAlign: "left" }),
        alignCenter:   e.isActive({ textAlign: "center" }),
        alignRight:    e.isActive({ textAlign: "right" }),
        alignJustify:  e.isActive({ textAlign: "justify" }),
        figureActive:  e.isActive("figure"),
        figureAlign:   e.getAttributes("figure").align ?? "center",
        canUndo:       e.can().undo(),
        canRedo:       e.can().redo(),
        color:         e.getAttributes("textStyle").color ?? null,
        lineHeight:    e.getAttributes("paragraph").lineHeight
                    ?? e.getAttributes("heading").lineHeight
                    ?? "1.6",
      };
    },
  });

  if (!editor || !s) return null;

  const triggerImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) onEditorImageUpload(file);
    };
    input.click();
  };

  const handleLinkConfirm = (url) => {
    setShowLinkModal(false);
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageUrlConfirm = (src, alt) => {
    setShowImageUrlModal(false);
    if (src) editor.chain().focus().insertFigure({ src, alt, width: 100, align: "center", caption: "" }).run();
  };

  const handleColorApply = useCallback((c) => {
    editor.chain().focus().setColor(c).run();
    setShowColorPicker(false);
  }, [editor]);

  const handleColorRemove = useCallback(() => {
    editor.chain().focus().unsetColor().run();
    setShowColorPicker(false);
  }, [editor]);

  return (
    <>
      {/* FIX #2: wrapper sticky — top=56px para compensar a topbar fixa */}
      <div className="ae-toolbar-sticky">
        <div className="ae-toolbar" role="toolbar" aria-label="Ferramentas de formatação">

          {/* Fonte */}
          <div className="ae-toolbar__group">
            <FontPicker currentFont={currentFont} onChange={onFontChange} />
          </div>

          {/* Espaçamento entre linhas */}
          <div className="ae-toolbar__group">
            <LineHeightPicker
              currentLineHeight={s.lineHeight}
              onChange={onSetLineHeight}
            />
          </div>

          {/* Headings */}
          <div className="ae-toolbar__group">
            <ToolBtn active={s.h1} label="H1" title="Título 1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Icons.H1 /></ToolBtn>
            <ToolBtn active={s.h2} label="H2" title="Título 2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Icons.H2 /></ToolBtn>
            <ToolBtn active={s.h3} label="H3" title="Título 3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Icons.H3 /></ToolBtn>
            <ToolBtn active={s.h4} label="H4" title="Título 4"
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Icons.H4 /></ToolBtn>
          </div>

          {/* Formatação inline nativa */}
          <div className="ae-toolbar__group">
            <ToolBtn active={s.bold} label="Negrito"
              onClick={() => editor.chain().focus().toggleBold().run()}><Icons.Bold /></ToolBtn>
            <ToolBtn active={s.italic} label="Itálico"
              onClick={() => editor.chain().focus().toggleItalic().run()}><Icons.Italic /></ToolBtn>
            <ToolBtn active={s.underline} label="Sublinhado"
              onClick={() => editor.chain().focus().toggleUnderline().run()}><Icons.Underline /></ToolBtn>
            <ToolBtn active={s.strike} label="Tachado"
              onClick={() => editor.chain().focus().toggleStrike().run()}><Icons.Strike /></ToolBtn>
            <ToolBtn active={s.code} label="Código inline"
              onClick={() => editor.chain().focus().toggleCode().run()}><Icons.Code /></ToolBtn>
          </div>

          {/* Cor do texto */}
          <div className="ae-toolbar__group" style={{ position: "relative" }}>
            <ColorBtn currentColor={s.color} onClick={() => setShowColorPicker((v) => !v)} />
            {showColorPicker && (
              <ColorPicker
                currentColor={s.color}
                onColor={handleColorApply}
                onRemove={handleColorRemove}
                onClose={() => setShowColorPicker(false)}
              />
            )}
          </div>

          {/* Alinhamento — texto OU figura */}
          <div className="ae-toolbar__group">
            <ToolBtn
              active={s.figureActive ? s.figureAlign === "left"   : s.alignLeft}
              label="Alinhar à esquerda"
              onClick={() => s.figureActive
                ? onSetFigureAlign("left")
                : editor.chain().focus().setTextAlign("left").run()
              }><Icons.AlignLeft /></ToolBtn>
            <ToolBtn
              active={s.figureActive ? s.figureAlign === "center" : s.alignCenter}
              label="Centralizar"
              onClick={() => s.figureActive
                ? onSetFigureAlign("center")
                : editor.chain().focus().setTextAlign("center").run()
              }><Icons.AlignCenter /></ToolBtn>
            <ToolBtn
              active={s.figureActive ? s.figureAlign === "right"  : s.alignRight}
              label="Alinhar à direita"
              onClick={() => s.figureActive
                ? onSetFigureAlign("right")
                : editor.chain().focus().setTextAlign("right").run()
              }><Icons.AlignRight /></ToolBtn>
            <ToolBtn
              active={s.alignJustify}
              disabled={s.figureActive}
              label="Justificar"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            ><Icons.AlignJustify /></ToolBtn>
          </div>

          {/* Listas */}
          <div className="ae-toolbar__group">
            <ToolBtn active={s.bulletList}  label="Lista"
              onClick={() => editor.chain().focus().toggleBulletList().run()}><Icons.ListUl /></ToolBtn>
            <ToolBtn active={s.orderedList} label="Lista numerada"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}><Icons.ListOl /></ToolBtn>
            <ToolBtn active={s.taskList}    label="Checklist"
              onClick={() => editor.chain().focus().toggleTaskList().run()}><Icons.CheckSquare /></ToolBtn>
          </div>

          {/* Blocos */}
          <div className="ae-toolbar__group">
            <ToolBtn active={s.blockquote} label="Citação"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}><Icons.Quote /></ToolBtn>
            <ToolBtn active={false}        label="Separador horizontal"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}><Icons.Minus /></ToolBtn>
            <ToolBtn active={s.codeBlock}  label="Bloco de código"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Icons.Code /></ToolBtn>
          </div>

          {/* Inserir */}
          <div className="ae-toolbar__group">
            <ToolBtn active={s.link} label="Link"
              onClick={() => setShowLinkModal(true)}><Icons.Link /></ToolBtn>
            <ToolBtn active={false} label="Imagem (upload)"
              onClick={triggerImageUpload}><Icons.Image /></ToolBtn>
            <ToolBtn active={false} label="Imagem (URL)"
              onClick={() => setShowImageUrlModal(true)}><Icons.Image /></ToolBtn>
          </div>

          {/* Histórico */}
          <div className="ae-toolbar__group">
            <ToolBtn active={false} disabled={!s.canUndo} label="Desfazer"
              onClick={() => editor.chain().focus().undo().run()}><Icons.Undo /></ToolBtn>
            <ToolBtn active={false} disabled={!s.canRedo} label="Refazer"
              onClick={() => editor.chain().focus().redo().run()}><Icons.Redo /></ToolBtn>
          </div>
        </div>
      </div>

      {showLinkModal && (
        <LinkModal
          onConfirm={handleLinkConfirm}
          onClose={() => setShowLinkModal(false)}
          initialUrl={editor.getAttributes("link").href ?? ""}
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

// ─── Save Indicator ───────────────────────────────────────────────────────────

const SaveIndicator = React.memo(({ status, isPublishing }) => {
  if (isPublishing) {
    return (
      <span className="ae-save-status ae-save-status--saving">
        <Icons.Loader /> Publicando…
      </span>
    );
  }
  const config = {
    idle:   { label: "Salvo",          cls: "idle"   },
    saving: { label: "Salvando…",      cls: "saving" },
    error:  { label: "Erro ao salvar", cls: "error"  },
  };
  const { label, cls } = config[status] ?? config.idle;
  return <span className={`ae-save-status ae-save-status--${cls}`}>{label}</span>;
});

// ─── Tag Input ────────────────────────────────────────────────────────────────

const TagInput = React.memo(({ tags, onChange }) => {
  const [value, setValue] = useState("");

  const handleKeyDown = (e) => {
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
          <Icons.Tag /> {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))}
            aria-label={`Remover tag ${t}`}><Icons.X /></button>
        </span>
      ))}
      <input value={value} onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Adicionar tag e pressionar Enter…" : "+"}
        aria-label="Nova tag" />
    </div>
  );
});

// ─── Cover Upload ─────────────────────────────────────────────────────────────

const CoverUpload = React.memo(({ src, isPublishing, onUpload, onRemove }) => {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) onUpload(file);
  };

  if (src) {
    return (
      <div className="ae-cover-preview ae-cover-preview--inline">
        <img src={src} alt="Capa do artigo" />
        {isPublishing && (
          <div className="ae-cover-publishing">
            <Icons.Loader /> Enviando…
          </div>
        )}
        <button type="button" className="ae-cover-remove" onClick={onRemove} disabled={isPublishing}>
          <Icons.X /> Remover capa
        </button>
      </div>
    );
  }

  return (
    <label className="ae-cover-dropzone ae-cover-dropzone--inline"
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
      onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}>
      <Icons.Upload size={20} />
      <span>Arraste a capa ou <u>clique</u></span>
      <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
    </label>
  );
});

// ─── MetaBar ─────────────────────────────────────────────────────────────────

const MetaBar = React.memo(({
  formData,
  isPublishing,
  setField,
  handleCoverUpload,
  handleCoverRemove,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`ae-metabar${open ? " ae-metabar--open" : ""}`}>
      <div className="ae-metabar__header" onClick={() => setOpen((v) => !v)}>
        <div className="ae-metabar__header-left">
          <Icons.Settings />
          <span className="ae-metabar__title">Metadados do artigo</span>
          {!open && (
            <div className="ae-metabar__pills">
              <span className={`ae-pill ae-pill--${formData.status.toLowerCase()}`}>
                {formData.status}
              </span>
              {formData.slug && (
                <span className="ae-pill ae-pill--slug">/{formData.slug}</span>
              )}
              {formData.tags.length > 0 && (
                <span className="ae-pill ae-pill--tags">
                  {formData.tags.length} tag{formData.tags.length > 1 ? "s" : ""}
                </span>
              )}
              {formData.coverImage && (
                <span className="ae-pill ae-pill--cover">Capa ✓</span>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="ae-metabar__toggle"
          aria-label={open ? "Fechar metadados" : "Abrir metadados"}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        >
          {open ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
        </button>
      </div>

      {open && (
        <div className="ae-metabar__body">
          <div className="ae-metabar__grid">
            <div className="ae-metabar__col">
              <div className="ae-field ae-field--row">
                <label className="ae-label">Status</label>
                <select className="ae-select" value={formData.status}
                  onChange={(e) => setField("status")(e.target.value)}>
                  <option>RASCUNHO</option>
                  <option>AGENDADO</option>
                  <option>PUBLICADO</option>
                </select>
              </div>
              <div className="ae-field ae-field--row">
                <label className="ae-label">Slug (URL)</label>
                <div className="ae-slug-field">
                  <span className="ae-slug-prefix"><Icons.Globe /></span>
                  <input className="ae-input" type="text" value={formData.slug}
                    onChange={(e) => setField("slug")(e.target.value)}
                    placeholder="meu-artigo" spellCheck={false} />
                </div>
              </div>
              <div className="ae-field ae-field--row">
                <label className="ae-label">Tags</label>
                <TagInput tags={formData.tags} onChange={setField("tags")} />
              </div>
            </div>
            <div className="ae-metabar__col">
              <div className="ae-field">
                <label className="ae-label">Imagem de Capa</label>
                <CoverUpload
                  src={formData.coverImage}
                  isPublishing={isPublishing}
                  onUpload={handleCoverUpload}
                  onRemove={handleCoverRemove}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Preview ──────────────────────────────────────────────────────────────────

const PreviewPane = React.memo(({ formData, content, onBack }) => (
  <div className="ae-preview">
    <div className="ae-preview__bar">
      <span className="ae-preview__label">Pré-visualização</span>
      <button className="ae-preview__back" onClick={onBack}>
        <Icons.Edit /> Voltar à edição
      </button>
    </div>
    <article className="ae-preview__article">
      {formData.coverImage && (
        <img className="ae-preview__cover" src={formData.coverImage} alt="Capa" />
      )}
      <header className="ae-preview__header">
        {formData.tags.length > 0 && (
          <div className="ae-preview__tags">
            {formData.tags.map((t) => <span key={t} className="ae-preview__tag">{t}</span>)}
          </div>
        )}
        <h1 className="ae-preview__title" style={{ fontFamily: formData.fontFamily }}>
          {formData.title || <em>Sem título</em>}
        </h1>
        {formData.subtitle && (
          <p className="ae-preview__subtitle" style={{ fontFamily: formData.fontFamily }}>
            {formData.subtitle}
          </p>
        )}
        <div className="ae-preview__meta">
          {formData.slug && <span className="ae-preview__slug">/{formData.slug}</span>}
          <span className={`ae-preview__status ae-status--${formData.status.toLowerCase()}`}>
            {formData.status}
          </span>
        </div>
      </header>
      <div className="ae-preview__body editorial-content"
        style={{ fontFamily: formData.fontFamily }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  </div>
));

// ─── ArticleEditor (componente raiz) ─────────────────────────────────────────

export default function ArticleEditor({
  initialData = {},
  onSave,
  onPublish,
  onCancel,
  autoSaveInterval = 5000,
}) {
  const [isPreview, setIsPreview] = useState(false);

  const {
    formData,
    saveStatus,
    isPublishing,
    editor,
    setField,
    handleTitleChange,
    handleFontChange,
    handleCoverUpload,
    handleCoverRemove,
    handleEditorImageUpload,
    setFigureAlign,
    setLineHeight,
    doSave,
    doPublish,
  } = useArticleEditor({ initialData, onSave, onPublish, autoSaveInterval });

  return (
    <div className="ae-root">

      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="ae-topbar">
        <div className="ae-topbar__left">
          <span className="ae-topbar__title">
            {isPreview ? "Pré-visualização" : "Editor de Artigo"}
          </span>
        </div>
        <div className="ae-topbar__center">
          <SaveIndicator status={saveStatus} isPublishing={isPublishing} />
        </div>
        <div className="ae-topbar__right">
          {onCancel && (
            <button type="button" className="ae-btn ae-btn--ghost" onClick={onCancel}
              disabled={isPublishing}>
              Cancelar
            </button>
          )}
          <button type="button" className="ae-btn ae-btn--save"
            onClick={doSave} disabled={isPublishing} title="Salvar rascunho (Ctrl+S)">
            <Icons.Save /> Salvar
          </button>
          <button type="button" className="ae-btn ae-btn--secondary"
            onClick={() => setIsPreview((v) => !v)} disabled={isPublishing}>
            {isPreview ? <><Icons.Edit /> Editar</> : <><Icons.Eye /> Visualizar</>}
          </button>
          <button type="button" className="ae-btn ae-btn--primary"
            onClick={doPublish} disabled={isPublishing}>
            {isPublishing ? <><Icons.Loader /> Publicando…</> : <><Icons.Send /> Publicar</>}
          </button>
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      {isPreview ? (
        <PreviewPane
          formData={formData}
          content={editor?.getHTML() ?? ""}
          onBack={() => setIsPreview(false)}
        />
      ) : (
        <div className="ae-editor-layout ae-editor-layout--stacked">

          <MetaBar
            formData={formData}
            isPublishing={isPublishing}
            setField={setField}
            handleCoverUpload={handleCoverUpload}
            handleCoverRemove={handleCoverRemove}
          />

          <main className="ae-main ae-main--full">
            <div className="ae-card ae-card--editor">

              <div className="ae-meta-inputs">
                <input className="ae-title-input" type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Título do artigo"
                  aria-label="Título"
                  style={{ fontFamily: formData.fontFamily }}
                />
                <input className="ae-subtitle-input" type="text"
                  value={formData.subtitle}
                  onChange={(e) => setField("subtitle")(e.target.value)}
                  placeholder="Subtítulo ou chamada"
                  aria-label="Subtítulo"
                  style={{ fontFamily: formData.fontFamily }}
                />
                <div className="ae-divider" />
              </div>

              <Toolbar
                editor={editor}
                currentFont={formData.fontFamily}
                onFontChange={handleFontChange}
                onEditorImageUpload={handleEditorImageUpload}
                onSetFigureAlign={setFigureAlign}
                onSetLineHeight={setLineHeight}
              />

              <div className="ae-editor-body editorial-content"
                style={{ fontFamily: formData.fontFamily }}>
                <EditorContent editor={editor} />
              </div>

            </div>
          </main>
        </div>
      )}
    </div>
  );
}
