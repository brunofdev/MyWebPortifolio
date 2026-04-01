// src/paginas/ArticleViewer.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArticleFeedbackPanel from "../components/ArticleFeedbackPanel";
import "../styles/articleviewer.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─────────────────────────────────────────
   UTILS
───────────────────────────────────────── */
const estimateReadTime = (html = "") => {
  const text = html.replace(/<[^>]+>/g, "");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
};

const slugify = (text) =>
  text.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, '-') // troca espaços por hífens
    .replace(/[^\w-]+/g, '') // remove caracteres não-alfanuméricos
    .replace(/--+/g, '-') // evita hífens duplos
    .replace(/^-+/, '').replace(/-+$/, ''); // limpa as pontas

/* ─────────────────────────────────────────
   READING PROGRESS BAR
───────────────────────────────────────── */
const ReadingProgressBar = ({ progress }) => (
  <div className="av-progress-track">
    <div className="av-progress-fill" style={{ width: `${progress}%` }} />
  </div>
);

/* ─────────────────────────────────────────
   FLOATING TOOLBAR
───────────────────────────────────────── */
const FloatingToolbar = ({ article }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {}
  };

  return (
    <div className={`av-toolbar ${visible ? "av-toolbar--visible" : ""}`}>
      <button
        className={`av-tool-btn ${liked ? "av-tool-btn--liked" : ""}`}
        onClick={() => setLiked(v => !v)}
        title={liked ? "Remover curtida" : "Curtir"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{liked ? "Curtido" : "Curtir"}</span>
      </button>

      <div className="av-tool-sep" />

      <button
        className={`av-tool-btn ${bookmarked ? "av-tool-btn--saved" : ""}`}
        onClick={() => setBookmarked(v => !v)}
        title={bookmarked ? "Remover dos salvos" : "Salvar"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <span>{bookmarked ? "Salvo" : "Salvar"}</span>
      </button>

      <div className="av-tool-sep" />

      <button
        className={`av-tool-btn ${copied ? "av-tool-btn--copied" : ""}`}
        onClick={handleShare}
        title="Compartilhar"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        )}
        <span>{copied ? "Copiado!" : "Compartilhar"}</span>
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────
   TABLE OF CONTENTS (Rastreamento Exato)
───────────────────────────────────────── */
const TableOfContents = ({ headings }) => {
  const [active, setActive] = useState("top");

  useEffect(() => {
    if (!headings || !headings.length) return;

    const handleScroll = () => {
      // Offset de 150px garante que a tag ativa mude assim que o título passar do cabeçalho
      const scrollPosition = window.scrollY + 150; 
      let currentId = "top"; // Começa apontando pro topo

      // Checa qual é o último título que já cruzou a linha superior da tela
      headings.forEach((h) => {
        const element = document.getElementById(h.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentId = h.id;
        }
      });

      setActive(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Pequeno delay para garantir que a página renderizou antes do primeiro cálculo
    const timeoutId = setTimeout(handleScroll, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [headings]);

  const handleScrollTo = (e, id) => {
    e.preventDefault();

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", window.location.pathname);
      setActive("top");
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      // 100px de offset para o título não ficar grudado no topo da tela ao clicar
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setActive(id);
    }
  };

  // Renderiza mesmo sem títulos (para poder usar o botão de voltar ao topo)
  return (
    <aside className="av-toc">
      <p className="av-toc-label">Navegação</p>
      <nav>
        {/* ── BOTÃO DE VOLTAR AO TOPO ── */}
        <a
          href="#top"
          className={`av-toc-item ${active === "top" ? "av-toc-item--active" : ""}`}
          onClick={(e) => handleScrollTo(e, "top")}
          style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
          Início do Artigo
        </a>

        {/* ── LISTA DE TÍTULOS ── */}
        {headings?.map(h => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`av-toc-item av-toc-item--${h.level} ${active === h.id ? "av-toc-item--active" : ""}`}
            onClick={(e) => handleScrollTo(e, h.id)}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
};

/* ─────────────────────────────────────────
   SKELETON
───────────────────────────────────────── */
const Skeleton = () => (
  <div className="av-skeleton">
    <div className="av-skel av-skel--chip" />
    <div className="av-skel av-skel--h1" />
    <div className="av-skel av-skel--h1 av-skel--h1b" />
    <div className="av-skel av-skel--sub" />
    <div className="av-skel av-skel--meta" />
    <div className="av-skel av-skel--cover" />
    {[90, 100, 75, 100, 88, 60].map((w, i) => (
      <div key={i} className="av-skel av-skel--line" style={{ width: `${w}%` }} />
    ))}
  </div>
);

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */
const ArticleViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readTime, setReadTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [readPct, setReadPct] = useState(0);

  // Estados para o HTML processado e o Sumário
  const [processedHtml, setProcessedHtml] = useState("");
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/geral/artigos/${slug}`);
        if (res.ok) {
          const data = await res.json();
          const art = data.dados || data;
          setArticle(art);
          setReadTime(estimateReadTime(art.contentHtml));

          if (art.contentHtml) {
            const doc = new DOMParser().parseFromString(art.contentHtml, "text/html");
            // Agora buscando H1, H2 e H3
            const nodes = Array.from(doc.querySelectorAll("h1, h2, h3"));
            const newHeadings = [];

            nodes.forEach((n, i) => {
              const text = n.textContent.trim();
              const id = slugify(text) || `av-h-${i}`;
              n.id = id; 
              newHeadings.push({ id, text, level: n.tagName.toLowerCase() });
            });

            setHeadings(newHeadings);
            setProcessedHtml(doc.body.innerHTML);
          }
        } else {
          navigate("/");
        }
      } catch { 
        navigate("/"); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [slug, navigate]);

  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const tot = el.scrollHeight - el.clientHeight;
      const pct = tot > 0 ? (el.scrollTop / tot) * 100 : 0;
      setProgress(pct);
      setReadPct(Math.min(100, Math.round(pct)));
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (loading) return <Skeleton />;
  if (!article) return null;

  const initial = article.criadoPor?.charAt(0).toUpperCase() || "B";
  const displayDate = new Date(article.dataCriacao).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <>
      <ReadingProgressBar progress={progress} />
      <FloatingToolbar article={article} />

      <div className="av-layout">
        
        {/* Sumário recebe os cabeçalhos já processados */}
        <TableOfContents headings={headings} />

        <article className="av-article av-fadein">
          <header className="av-header">
            {article.tags?.length > 0 && (
              <div className="av-tags">
                {article.tags.map(t => <span key={t} className="av-tag">#{t}</span>)}
              </div>
            )}

            <h1 className="av-title">{article.title}</h1>

            {article.subtitle && <p className="av-subtitle">{article.subtitle}</p>}

            <div className="av-meta-bar">
              <div className="av-author">
                <div className="av-author-avatar">{initial}</div>
                <div>
                  <span className="av-author-name">{article.criadoPor || "Bruno Fraga"}</span>
                  <span className="av-author-meta">
                    {displayDate}
                    <span className="av-dot">·</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline",verticalAlign:"middle",marginRight:3}}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {readTime} min de leitura
                  </span>
                </div>
              </div>

              {readPct > 8 && readPct < 96 && (
                <div className="av-ring" title={`${readPct}% lido`}>
                  <svg width="32" height="32" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="#21262d" strokeWidth="3"/>
                    <circle
                      cx="16" cy="16" r="12" fill="none" stroke="#3fb950" strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 12}`}
                      strokeDashoffset={`${2 * Math.PI * 12 * (1 - readPct / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 16 16)"
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                  <span className="av-ring-label">{readPct}%</span>
                </div>
              )}
            </div>
          </header>

          {article.coverImage && (
            <figure className="av-cover">
              <img src={article.coverImage} alt={article.title} loading="lazy" />
            </figure>
          )}

          <section
            className="av-content"
            style={{ fontFamily: article.fontFamily || "inherit" }}
            dangerouslySetInnerHTML={{ __html: processedHtml || article.contentHtml }}
          />

          {article.tags?.length > 0 && (
            <div className="av-footer-tags">
              {article.tags.map(t => <span key={t} className="av-tag av-tag--dim">#{t}</span>)}
            </div>
          )}

          <div className="av-author-card">
            <div className="av-author-card-ring">
              <div className="av-author-card-avatar">{initial}</div>
            </div>
            <div className="av-author-card-info">
              <span className="av-author-card-name">{article.criadoPor || "Bruno Fraga"}</span>
              <span className="av-author-card-bio">
                Backend Developer · Java · Spring Boot · Clean Architecture · DDD
              </span>
            </div>
            <a
              href="https://www.linkedin.com/in/bruno-fraga-dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="av-follow-btn"
            >
              Seguir
            </a>
          </div>

          {article.id && (
            <div className="av-feedback-zone">
              <ArticleFeedbackPanel articleId={article.id} />
            </div>
          )}

          <footer className="av-footer">
            <button className="av-back-btn" onClick={() => navigate("/artigos")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Voltar para os artigos
            </button>
          </footer>
        </article>
      </div>
    </>
  );
};

export default ArticleViewer;