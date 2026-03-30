import React, { useState, useEffect, useRef } from "react";
import "../styles/articlecarousel.css";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080";
const SLIDE_DURATION = 6000; // ms
const TICK_MS = 50;           // atualiza a barra a cada 50ms (~20fps, leve e suficiente)
const MAX_ARTICLES = 6;

const ArticleCarousel = () => {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0); // ms decorridos no slide atual
  const [isHovered, setIsHovered] = useState(false);

  // Refs — valores que o intervalo precisa ler sem stale closure
  const isHoveredRef = useRef(false);
  const articlesLenRef = useRef(0);
  const intervalRef = useRef(null);

  // Sincroniza refs
  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);
  useEffect(() => { articlesLenRef.current = articles.length; }, [articles]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/geral/artigos/listar-todos`);
      if (res.ok) {
        const payload = await res.json();
        const lista = payload.dados || payload.data || payload;
        if (Array.isArray(lista) && lista.length > 0) {
          const sorted = lista
            .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
            .slice(0, MAX_ARTICLES);
          setArticles(sorted);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar artigos:", err);
    }
  };

  useEffect(() => {
    if (articles.length === 0) return;

    // 1. Zera o progresso imediatamente ao trocar de slide
    setElapsed(0);

    // 2. Criamos um Timeout para esperar os 650ms da transição do CSS
    const delayAntesDeComecar = setTimeout(() => {

      intervalRef.current = setInterval(() => {
        if (isHoveredRef.current) return;

        setElapsed((prev) => {
          const next = prev + TICK_MS;
          if (next >= SLIDE_DURATION) {
            setCurrentIndex((ci) => (ci + 1) % articlesLenRef.current);
            return 0;
          }
          return next;
        });
      }, TICK_MS);

    }, 650); // Exatos 650ms da transição do .kc-track no CSS

    return () => {
      clearTimeout(delayAntesDeComecar);
      clearInterval(intervalRef.current);
    };
  }, [articles.length, currentIndex]);
  // ── Navegação manual ─────────────────────────────────────────────────────
  const goTo = (idx) => {
    if (idx === currentIndex) return;
    setElapsed(0);
    setCurrentIndex(idx);
  };

  const goPrev = () => goTo((currentIndex - 1 + articles.length) % articles.length);
  const goNext = () => goTo((currentIndex + 1) % articles.length);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const progress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

  const formatarData = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (articles.length === 0) return null;

  return (

    <div className="kc-wrapper">
      <div className="kc-header">
        Ultimos artigos publicados
      </div>
      <div
        className="kc-viewport"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track */}
        <div
          className="kc-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {articles.map((art) => (
            <div key={art.id} className="kc-slide">
              <div className="kc-bg">
                <img
                  src={art.coverImage || "https://picsum.photos/800/400"}
                  alt={art.title}
                  className="kc-bg-img"
                />
                <div className="kc-overlay" />
              </div>

              <div className="kc-content">
                <div className="kc-tags">
                  {art.tags?.slice(0, 3).map((tag, i) => (
                    <span key={i} className="kc-tag">{tag}</span>
                  ))}
                </div>

                <h3 className="kc-title">{art.title}</h3>

                <p className="kc-subtitle">
                  {art.subtitle?.length > 130
                    ? art.subtitle.slice(0, 130) + "…"
                    : art.subtitle}
                </p>

                <div className="kc-meta">
                  <span className="kc-date">{formatarData(art.dataCriacao)}</span>
                  <span className="kc-author">✍ {art.criadoPor}</span>
                </div>

                <button
                  className="kc-btn"
                  onClick={() => console.log(`/artigo/${art.slug}`)}
                >
                  Ler artigo completo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Setas */}
        {articles.length > 1 && (
          <button className="kc-arrow kc-arrow--left" onClick={goPrev} aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {articles.length > 1 && (
          <button className="kc-arrow kc-arrow--right" onClick={goNext} aria-label="Próximo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Barras de progresso */}
        <div className="kc-bars">
          {articles.map((_, idx) => (
            <button
              key={idx}
              className="kc-bar-btn"
              onClick={() => goTo(idx)}
              aria-label={`Slide ${idx + 1}`}
            >
              <div className="kc-bar-track">
                <div
                  className="kc-bar-fill"
                  style={{
                    width:
                      idx < currentIndex ? "100%" :
                        idx === currentIndex ? `${progress}%` :
                          "0%",
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Contador */}
        <div className="kc-counter">
          {currentIndex + 1} / {articles.length}
        </div>
      </div>
    </div>
  );
};

export default ArticleCarousel;
