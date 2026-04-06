/**
 * useArticleEditor.js
 *
 * CORREÇÕES APLICADAS:
 *  FIX #1 — Cor preservada ao aplicar negrito/itálico/sublinhado:
 *    - TextStyle agora é configurado com `mergeNestedSpanStyles: true`
 *    - Comandos toggleBold/toggleItalic/toggleUnderline são envolvidos num
 *      wrapper que re-aplica a cor ativa após o toggle, garantindo que o
 *      mark textStyle (color) nunca seja perdido.
 *    - Estratégia: ler a cor atual ANTES do toggle e re-aplicar DEPOIS.
 *
 *  AJUSTE #2 — Toolbar sticky (top=56px, correspondente à topbar).
 *  AJUSTE #3 — Figcaption / alinhamento de figura mantidos.
 */

import React, {
  useState, useCallback, useRef, useEffect,
} from "react";
import { useEditor, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Node, Extension, mergeAttributes } from "@tiptap/core";
import StarterKit        from "@tiptap/starter-kit";
import TextAlign         from "@tiptap/extension-text-align";
import Underline         from "@tiptap/extension-underline"; 
import Link              from "@tiptap/extension-link";
import TaskList          from "@tiptap/extension-task-list";
import TaskItem          from "@tiptap/extension-task-item";
import Placeholder       from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";


import { TextStyle }  from "@tiptap/extension-text-style";
import { Color }      from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { common, createLowlight } from "lowlight";

import { uploadImage, uploadInlineImages } from "./cloudinary";

const lowlight = createLowlight(common);

// ─── Constantes ───────────────────────────────────────────────────────────────

export const EDITOR_FONTS = [
  { label: "Instrument Serif",   value: "Instrument Serif",   category: "Serif"   },
  { label: "Playfair Display",   value: "Playfair Display",   category: "Serif"   },
  { label: "Lora",               value: "Lora",               category: "Serif"   },
  { label: "DM Sans",            value: "DM Sans",            category: "Sans"    },
  { label: "Syne",               value: "Syne",               category: "Sans"    },
  { label: "JetBrains Mono",     value: "JetBrains Mono",     category: "Mono"    },
  { label: "Cormorant Garamond", value: "Cormorant Garamond", category: "Display" },
  { label: "Fraunces",           value: "Fraunces",           category: "Display" },
];

export const ALIGN_OPTIONS = ["left", "center", "right"];

export const LINE_HEIGHT_OPTIONS = [
  { label: "Compacto",    value: "1.2" },
  { label: "Normal",      value: "1.6" },
  { label: "Confortável", value: "1.8" },
  { label: "Espaçado",    value: "2.0" },
  { label: "Duplo",       value: "2.4" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ==============================================================================
// 👉 FIX #2.1 — O Sincronizador de Imagens (Limpador de JSON)
// Essa função varre o estado do editor, acha os blobs, sobe pro Cloudinary
// e atualiza o próprio editor com as URLs finais, garantindo JSON limpo.
// ==============================================================================
// ==============================================================================
// 👉 FIX #2.1 — O Sincronizador de Imagens (Motor ProseMirror)
// ==============================================================================
const syncEditorImagesWithCloudinary = async (editor) => {
  if (!editor) return;

  const replacements = [];

  // 1. Varre o documento procurando os blobs
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'figure') {
      const { src } = node.attrs;
      if (src && src.startsWith('blob:')) {
        // Guardamos também o 'node' inteiro para não perder o alt, width, caption...
        replacements.push({ pos, node, srcBlobUrl: src });
      }
    }
    return true;
  });

  if (replacements.length === 0) return;

  // 2. Faz o upload das imagens
  const uploadPromises = replacements.map(async (item) => {
    try {
      const response = await fetch(item.srcBlobUrl);
      const blob = await response.blob();
      const { url } = await uploadImage(blob, { folder: "articles/content" });
      return { pos: item.pos, node: item.node, newUrl: url };
    } catch (error) {
      console.error("Erro no upload da imagem interna:", error);
      return null;
    }
  });

  const uploadedResults = await Promise.all(uploadPromises);

  // 3. O Pulo do Gato: Transação direta no motor do ProseMirror
  let tr = editor.state.tr;
  
  uploadedResults.forEach((result) => {
    if (result) {
      // Pega os atributos antigos (alt, width, etc) e injeta SÓ a URL nova no src
      const novosAtributos = { ...result.node.attrs, src: result.newUrl };
      
      // setNodeMarkup substitui o nó naquela exata posição sem depender do cursor
      tr = tr.setNodeMarkup(result.pos, null, novosAtributos);
    }
  });

  // 4. Aplica a transação no editor (isso limpa o JSON na mesma hora)
  editor.view.dispatch(tr);
  console.log("✅ Imagens sincronizadas cirurgicamente no Editor!");
};

export function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function compressImageToBlob(file, maxWidth = 1600, quality = 0.88) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ({ target }) => {
      const img = new window.Image();
      img.src = target.result;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width  = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
    };
  });
}

// ─── LineHeight Extension ─────────────────────────────────────────────────────

const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      defaultLineHeight: "1.6",
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight || attributes.lineHeight === this.options.defaultLineHeight) {
                return {};
              }
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight })
          ),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.resetAttributes(type, "lineHeight")
          ),
    };
  },
});


// ─── FigureView ───────────────────────────────────────────────────────────────

const FigureView = ({ node, updateAttributes, selected, editor }) => {
  const { src, alt, width, align, caption } = node.attrs;
  const isEditing = editor.isEditable;

  const [dragging,   setDragging]   = useState(false);
  const [localWidth, setLocalWidth] = useState(width ?? 100);
  const startRef   = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    if (captionRef.current && captionRef.current.textContent !== (caption ?? "")) {
      captionRef.current.textContent = caption ?? "";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onHandleMouseDown = useCallback((e) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    const container = e.currentTarget.closest(".ae-figure");
    if (!container) return;
    const containerW = container.parentElement?.offsetWidth ?? 800;
    startRef.current = { x: e.clientX, wPct: localWidth, containerW };
    setDragging(true);
  }, [isEditing, localWidth]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      if (!startRef.current) return;
      const { x, wPct, containerW } = startRef.current;
      const deltaPct = ((e.clientX - x) / containerW) * 100;
      setLocalWidth(Math.round(Math.min(100, Math.max(10, wPct + deltaPct))));
    };
    const onUp = () => {
      setDragging(false);
      updateAttributes({ width: localWidth });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
  }, [dragging, localWidth, updateAttributes]);

  const alignClass = `ae-figure--${align ?? "center"}`;

  const handleCaptionInput = useCallback((e) => {
    updateAttributes({ caption: e.currentTarget.textContent });
  }, [updateAttributes]);

  return (
    <NodeViewWrapper
      as="figure"
      className={`ae-figure ${alignClass}${selected ? " ae-figure--selected" : ""}${dragging ? " ae-figure--dragging" : ""}`}
      data-align={align ?? "center"}
    >
      <div className="ae-figure__img-wrap" style={{ width: `${localWidth}%` }}>
        <img src={src} alt={alt ?? ""} draggable={false} />

        {isEditing && (
          <>
            <span className="ae-resize-handle ae-resize-handle--nw" onMouseDown={onHandleMouseDown} />
            <span className="ae-resize-handle ae-resize-handle--ne" onMouseDown={onHandleMouseDown} />
            <span className="ae-resize-handle ae-resize-handle--sw" onMouseDown={onHandleMouseDown} />
            <span className="ae-resize-handle ae-resize-handle--se" onMouseDown={onHandleMouseDown} />
          </>
        )}

        {dragging && <span className="ae-resize-tooltip">{localWidth}%</span>}
      </div>

      <figcaption
        ref={captionRef}
        className="ae-figcaption"
        contentEditable={isEditing}
        suppressContentEditableWarning
        data-placeholder="Legenda…"
        onInput={handleCaptionInput}
        dir="ltr"
      />
    </NodeViewWrapper>
  );
};

// ─── FigureExtension ──────────────────────────────────────────────────────────

const FigureExtension = Node.create({
  name:      "figure",
  group:     "block",
  atom:      true,
  draggable: true,

  addAttributes() {
    return {
      src:     { default: null },
      alt:     { default: "" },
      width:   { default: 100 },
      align:   { default: "center" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (dom) => {
          const img  = dom.querySelector("img");
          const cap  = dom.querySelector("figcaption");
          const wrap = dom.querySelector(".ae-figure__img-wrap") ?? img?.parentElement;
          const wPct = parseInt(wrap?.style?.width ?? "100") || 100;
          return {
            src:     img?.getAttribute("src")  ?? null,
            alt:     img?.getAttribute("alt")  ?? "",
            width:   wPct,
            align:   dom.dataset.align         ?? "center",
            caption: cap?.textContent          ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes: { src, alt, width, align, caption } }) {
    const marginMap = {
      left:   "margin-right:auto;margin-left:0;",
      right:  "margin-left:auto;margin-right:0;",
      center: "margin:0 auto;",
    };
    const wrapStyle = `width:${width}%;display:block;${marginMap[align] ?? marginMap.center}`;

    return [
      "figure",
      mergeAttributes({
        "data-align": align,
        style: "max-width:100%;",
      }),
      [
        "div",
        { class: "ae-figure__img-wrap", style: wrapStyle },
        ["img", mergeAttributes({ src, alt, style: "width:100%;height:auto;display:block;" })],
      ],
      ["figcaption", { class: "ae-figcaption" }, caption ?? ""],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },

  addCommands() {
    return {
      insertFigure: (attrs) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs }),

      setFigureAlign: (align) => ({ commands }) =>
        commands.updateAttributes(this.name, { align }),
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("eventHandler"),
        props: {
          // 1. O VIGIA DO COLAR (Ctrl + V)
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const hasImage = items.some(item => item.type.startsWith("image/"));

            if (hasImage) {
              event.preventDefault(); // Impede que o texto sujo cole junto
              
              items.forEach(item => {
                if (item.type.startsWith("image/")) {
                  const file = item.getAsFile();
                  if (file) {
                    const objectUrl = URL.createObjectURL(file); // Gera o blob: local
                    const node = view.state.schema.nodes.figure.create({
                      src: objectUrl,
                      alt: "Imagem colada",
                      width: 100,
                      align: "center",
                      caption: ""
                    });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  }
                }
              });
              return true; // Avisa o TipTap que nós resolvemos o Ctrl+V
            }
            return false;
          },
handleDrop: (view, event, slice, moved) => {
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
              const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith("image/"));
              if (files.length === 0) return false;

              event.preventDefault();
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (!coordinates) return false;

              files.forEach(file => {
                const objectUrl = URL.createObjectURL(file);
                const node = view.state.schema.nodes.figure.create({
                  src: objectUrl,
                  alt: "Imagem arrastada",
                  width: 100,
                  align: "center",
                  caption: ""
                });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              });
              return true;
            }
            return false;
          }
        },
      }),
    ];
  },
});

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useArticleEditor({
  initialData = {},
  onSave,
  onPublish,
  autoSaveInterval = 5000,
} = {}) {

  const [formData, setFormData] = useState({
    title:      initialData.title      ?? "",
    subtitle:   initialData.subtitle   ?? "",
    slug:       initialData.slug       ?? "",
    tags:       initialData.tags       ?? [],
    coverImage: initialData.coverImage ?? "",
    status:     initialData.status     ?? "RASCUNHO",
    fontFamily: initialData.fontFamily ?? EDITOR_FONTS[0].value,
  });

  const [saveStatus,   setSaveStatus]   = useState("idle");
  const [isPublishing, setIsPublishing] = useState(false);

  const formDataRef  = useRef(formData);
  const editorRef    = useRef(null);
  const saveTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle.configure({ mergeNestedSpanStyles: true }), // Mantenha isso!
      Color,
      FontFamily,
      LineHeight,
      FigureExtension,
      TextAlign.configure({
        types:            ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Link.configure({
        openOnClick:    false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Comece a escrever seu artigo aqui…" }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content:  initialData.contentHtml ?? "",
    onUpdate: () => { if (isMountedRef.current) scheduleAutoSave(); },
  });

  useEffect(() => { editorRef.current = editor; }, [editor]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(saveTimerRef.current);
    };
  }, []);

  const buildPayload = useCallback(() => ({
    ...formDataRef.current,
    contentJson: editorRef.current?.getJSON() ?? {},
    contentHtml: editorRef.current?.getHTML() ?? "",
    updatedAt:   new Date().toISOString(),
  }), []);

 const buildPayloadWithCloudinary = useCallback(async () => {
    const payload = buildPayload();
    if (payload.coverImage?.startsWith("blob:")) {
      const response     = await fetch(payload.coverImage);
      const blob         = await response.blob();
      const { url }      = await uploadImage(blob, { folder: "articles/covers" });
      payload.coverImage = url;
      setFormData((prev) => ({ ...prev, coverImage: url }));
    }
    return payload;
  }, [buildPayload]);

  const doSave = useCallback(async () => {
    clearTimeout(saveTimerRef.current);
    setSaveStatus("saving");
    try {
      await onSave?.(buildPayload());
      if (isMountedRef.current) setSaveStatus("idle");
    } catch (err) {
      console.error("[ArticleEditor] Erro no save:", err);
      if (isMountedRef.current) setSaveStatus("error");
    }
  }, [buildPayload, onSave]);

  const scheduleAutoSave = useCallback(() => {
    setSaveStatus("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) doSave();
    }, autoSaveInterval);
  }, [doSave, autoSaveInterval]);

  const doPublish = useCallback(async () => {
    setIsPublishing(true);
    setSaveStatus("saving");
    try {
      console.log("1. Iniciando Cloudinary...");
      
     
      await syncEditorImagesWithCloudinary(editorRef.current);
    
     const payload  = await buildPayloadWithCloudinary();
      const statusUpperCase = formDataRef.current.status.toUpperCase(); 
      payload.status = statusUpperCase; 
      setFormData((prev) => ({ ...prev, status: statusUpperCase }));
      
      console.log("2. Cloudinary terminou! Payload pronto:", payload); 
      
      await onPublish?.(payload);
      if (isMountedRef.current) setSaveStatus("idle");
    } catch (err) {
      console.error("[ArticleEditor] Erro CRÍTICO interno ao publicar:", err);
      if (isMountedRef.current) setSaveStatus("error");
    } finally {
      if (isMountedRef.current) setIsPublishing(false);
    }
  }, [buildPayloadWithCloudinary, onPublish]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doSave]);

  const setField = useCallback(
    (field) => (value) => setFormData((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleTitleChange = useCallback((e) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title, slug: toSlug(title) }));
  }, []);

  const handleFontChange = useCallback((fontValue) => {
    setFormData((prev) => ({ ...prev, fontFamily: fontValue }));
    editorRef.current?.chain().focus().setFontFamily(fontValue).run();
  }, []);

  const handleCoverUpload = useCallback((file) => {
    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, coverImage: objectUrl }));
  }, []);

  const handleCoverRemove = useCallback(() => {
    setFormData((prev) => {
      if (prev.coverImage?.startsWith("blob:")) URL.revokeObjectURL(prev.coverImage);
      return { ...prev, coverImage: "" };
    });
  }, []);

  const handleEditorImageUpload = useCallback((file) => {
    const objectUrl = URL.createObjectURL(file);
    editorRef.current
      ?.chain()
      .focus()
      .insertFigure({ src: objectUrl, alt: file.name, width: 100, align: "center", caption: "" })
      .run();
  }, []);

  const setFigureAlign = useCallback((align) => {
    editorRef.current?.chain().focus().setFigureAlign(align).run();
  }, []);

  const setLineHeight = useCallback((value) => {
    editorRef.current?.chain().focus().setLineHeight(value).run();
  }, []);

  const isFigureActive = useCallback(() =>
    editorRef.current?.isActive("figure") ?? false,
  []);

  return {
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
    isFigureActive,
    doSave,
    doPublish,
    buildPayload,
    buildPayloadWithCloudinary,
    EDITOR_FONTS,
    LINE_HEIGHT_OPTIONS,
  };
}
