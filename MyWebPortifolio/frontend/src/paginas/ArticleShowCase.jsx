// src/paginas/ArticleShowcase.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/articleshowcase.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80";

/* ─────────────────────────────────────────
   UTILS & UX HELPERS
───────────────────────────────────────── */
const estimateReadTime = (html = "") => {
  const text = html?.replace(/<[^>]+>/g, "") || "";
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// UX Magic: Destaca o texto pesquisado no título
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? <mark key={i} className="asc-highlight">{part}</mark> : part
      )}
    </>
  );
};

/* ─────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────── */
const SkeletonCard = ({ index }) => (
  <div className="asc-card asc-card--skeleton" style={{ animationDelay: `${index * 0.08}s` }}>
    <div className="asc-skel asc-skel--img" />
    <div className="asc-card-body">
      <div className="asc-skel asc-skel--title" />
      <div className="asc-skel asc-skel--title asc-skel--title-sm" />
      <div className="asc-skel asc-skel--text" />
      <div className="asc-skel asc-skel--text asc-skel--text-sm" />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   ARTICLE CARD
───────────────────────────────────────── */
const ArticleCard = React.memo(({ article, index, onClick, searchTerm }) => {
  const readTime = useMemo(() => estimateReadTime(article.contentHtml), [article.contentHtml]);

  return (
    <article
      className="asc-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onClick()}
      aria-label={`Ler artigo: ${article.title}`}
    >
      {/* ── CAPA E TAGS (O Segredo da UX aqui) ── */}
      <div className="asc-card-img-wrap">
        <img
          src={article.coverImage || FALLBACK_IMG}
          alt={article.title}
          className="asc-card-img"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
        />
        {/* Gradiente escuro para garantir leitura das tags */}
        <div className="asc-card-img-overlay" />

        {/* Tempo de leitura (Topo Direito) */}
        <div className="asc-card-top-bar">
          <span className="asc-card-readtime">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {readTime} min
          </span>
        </div>

        {/* Todas as Tags SOBRE a capa (Base) */}
        {article.tags?.length > 0 && (
          <div className="asc-card-tags-overlay">
            {article.tags.map(t => (
              <span key={t} className="asc-tag-badge">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── CORPO DO CARD ── */}
      <div className="asc-card-body">
        <time className="asc-card-date">{formatDate(article.dataCriacao)}</time>
        
        <h3 className="asc-card-title">
          <HighlightText text={article.title || "Sem título"} highlight={searchTerm} />
        </h3>

        {article.subtitle && (
          <p className="asc-card-excerpt">
            {article.subtitle.length > 100
              ? article.subtitle.substring(0, 100) + "…"
              : article.subtitle}
          </p>
        )}

        {/* Footer com Autor e Call to Action */}
        <div className="asc-card-footer">
          <div className="asc-card-author">
            <div className="asc-card-author-avatar">
              {(article.criadoPor || "B").charAt(0).toUpperCase()}
            </div>
            <span>{article.criadoPor || "Bruno Fraga"}</span>
          </div>
          <span className="asc-card-cta">
            Ler
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </div>

      <div className="asc-card-glow" />
    </article>
  );
});

/* ─────────────────────────────────────────
   COMMAND BAR
───────────────────────────────────────── */
const CommandBar = ({ value, onChange, resultCount, total }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="asc-command-bar">
      <div className="asc-command-prefix">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        className="asc-command-input"
        placeholder="Buscar por título, assunto ou tag..."
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Buscar artigos"
      />
      {value && (
        <button className="asc-command-clear" onClick={() => onChange("")} aria-label="Limpar busca">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
      <div className="asc-command-meta">
        <span className="asc-command-count">
          {value ? `${resultCount} de ${total}` : `${total} artigos`}
        </span>
        <kbd className="asc-kbd" title="Pressione '/' para buscar">/</kbd>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   VIEW TOGGLE
───────────────────────────────────────── */
const ViewToggle = ({ view, onChange }) => (
  <div className="asc-view-toggle" role="group" aria-label="Modo de visualização">
    <button
      className={`asc-view-btn ${view === "grid" ? "asc-view-btn--active" : ""}`}
      onClick={() => onChange("grid")}
      title="Grade"
      aria-pressed={view === "grid"}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    </button>
    <button
      className={`asc-view-btn ${view === "list" ? "asc-view-btn--active" : ""}`}
      onClick={() => onChange("list")}
      title="Lista"
      aria-pressed={view === "list"}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    </button>
  </div>
);

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const ArticleShowcase = () => {
  const navigate = useNavigate();

  const [articles,  setArticles]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [tag,       setTag]       = useState("Todos");
  const [sort,      setSort]      = useState("newest");
  const [view,      setView]      = useState("grid");
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${BASE_URL}/geral/artigos/listar-todos`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.dados || data || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); setMounted(true); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let res = articles;

    if (search) {
      const q = search.toLowerCase();
      res = res.filter(a =>
        (a.title?.toLowerCase().includes(q)) ||
        (a.subtitle?.toLowerCase().includes(q)) ||
        (a.tags?.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (tag !== "Todos") {
      res = res.filter(a => a.tags?.includes(tag));
    }

    return [...res].sort((a, b) => {
      const dA = new Date(a.dataCriacao || 0).getTime();
      const dB = new Date(b.dataCriacao || 0).getTime();
      return sort === "newest" ? dB - dA : dA - dB;
    });
  }, [articles, search, tag, sort]);

  const allTags = useMemo(
    () => ["Todos", ...new Set(articles.flatMap(a => a.tags || []))],
    [articles]
  );

  const goToArticle = useCallback((slug) => navigate(`/artigo/${slug}`), [navigate]);

  return (
    <div className={`asc-root ${mounted ? "asc-root--in" : ""}`}>
      <header className="asc-hero">
        <div className="asc-hero-eyebrow">
          <span className="asc-hero-dot" />
          <span className="asc-hero-eyebrow-text">BrunoFraga.dev · Acervo técnico</span>
        </div>
        <h1 className="asc-hero-title">
          Explorar<br />
          <span className="asc-hero-accent">Artigos</span>
        </h1>
        <p className="asc-hero-sub">
          Insights sobre Java, arquitetura de software, boas práticas e desenvolvimento backend.
        </p>

        {!loading && (
          <div className="asc-hero-stats">
            <div className="asc-stat">
              <span className="asc-stat-val">{articles.length}</span>
              <span className="asc-stat-label">artigos</span>
            </div>
            <div className="asc-stat-sep" />
            <div className="asc-stat">
              <span className="asc-stat-val">{allTags.length - 1}</span>
              <span className="asc-stat-label">categorias</span>
            </div>
            <div className="asc-stat-sep" />
            <div className="asc-stat">
              <span className="asc-stat-val">
                {Math.round(articles.reduce((acc, a) => acc + estimateReadTime(a.contentHtml), 0) / (articles.length || 1))}
              </span>
              <span className="asc-stat-label">min médio</span>
            </div>
          </div>
        )}
      </header>

      <div className="asc-controls">
        <CommandBar value={search} onChange={setSearch} resultCount={filtered.length} total={articles.length} />

        <div className="asc-toolbar-row">
          {/* Scroll Horizontal Suave para as Tags */}
          <div className="asc-pills-scroll">
            {allTags.map(t => (
              <button
                key={t}
                className={`asc-pill ${tag === t ? "asc-pill--active" : ""}`}
                onClick={() => setTag(t)}
              >
                {t === "Todos" ? "Todos" : `#${t}`}
              </button>
            ))}
          </div>

          <div className="asc-right-controls">
            <select
              className="asc-sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
              aria-label="Ordenar por"
            >
              <option value="newest">↓ Mais recentes</option>
              <option value="oldest">↑ Mais antigos</option>
            </select>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`asc-grid asc-grid--${view}`}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <section className={`asc-grid asc-grid--${view}`} aria-label="Lista de artigos">
          {filtered.map((a, i) => (
            <ArticleCard
              key={a.id || a.slug}
              article={a}
              index={i}
              onClick={() => goToArticle(a.slug)}
              searchTerm={search}
            />
          ))}
        </section>
      ) : (
        <div className="asc-empty">
          <div className="asc-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <h3>Nenhum resultado para "{search || tag}"</h3>
          <p>Tente outros termos ou remova os filtros.</p>
          <button className="asc-empty-reset" onClick={() => { setSearch(""); setTag("Todos"); }}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleShowcase;