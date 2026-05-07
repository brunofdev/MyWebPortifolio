import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import "../styles/live-preview-modal.css";

/**
 * LivePreviewModal
 * Renderiza um iframe com fallback inteligente.
 * Se o site bloquear iframe (X-Frame-Options), exibe mensagem elegante.
 */
const LivePreviewModal = ({ url, title, isOpen, onClose }) => {
  const [iframeState, setIframeState] = useState("loading"); // loading | ready | blocked
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setIframeState("loading");
      // Timeout: se onLoad não disparar em 8s, assume bloqueado (ex: net::ERR sem onError)
      timeoutRef.current = setTimeout(() => {
        setIframeState((s) => (s === "loading" ? "blocked" : s));
      }, 60000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isOpen, url]);

  // Fechar com ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleIframeLoad = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIframeState("ready");
  }, []);

  const handleIframeError = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIframeState("blocked");
  }, []);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="lpm-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Live preview: ${title}`}
    >
      <div className="lpm-shell" onClick={(e) => e.stopPropagation()}>

        {/* ── Topbar ── */}
        <header className="lpm-topbar">
          <div className="lpm-topbar__left">
            <div className="lpm-dots" aria-hidden="true">
              <span className="lpm-dot lpm-dot--red" />
              <span className="lpm-dot lpm-dot--yellow" />
              <span className="lpm-dot lpm-dot--green" />
            </div>
            <span className="lpm-url-bar">
              <span className="lpm-url-protocol">https://</span>
              <span className="lpm-url-host">{url.replace(/^https?:\/\//, "").split("/")[0]}</span>
              <span className="lpm-url-path">/{url.replace(/^https?:\/\//, "").split("/").slice(1).join("/")}</span>
            </span>
          </div>

          <div className="lpm-topbar__right">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="lpm-btn-external"
              title="Abrir em nova aba"
              aria-label="Abrir em nova aba"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              nova aba
            </a>
            <button className="lpm-btn-close" onClick={onClose} aria-label="Fechar preview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ── Viewport ── */}
        <div className="lpm-viewport">

          {/* Loading state */}
          {iframeState === "loading" && (
            <div className="lpm-state lpm-state--loading" aria-live="polite">
              <div className="lpm-spinner">
                <svg width="56" height="56" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(74,222,128,0.15)" strokeWidth="3"/>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#4ade80" strokeWidth="3"
                    strokeDasharray="60 40" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="lpm-state__title">Acordando o servidor...</p>
              <p className="lpm-state__sub">
                Servidores gratuitos hibernam quando inativos. Aguarde até 60 segundos na primeira requisição.
              </p>
            </div>
          )}

          {/* Blocked state */}
          {iframeState === "blocked" && (
            <div className="lpm-state lpm-state--blocked">
              <div className="lpm-blocked-icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p className="lpm-state__title">Preview bloqueado pelo servidor</p>
              <p className="lpm-state__sub">
                Este site restringe exibição em iframe por política de segurança.<br/>
                Acesse diretamente para ver o projeto ao vivo.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="lpm-btn-fallback"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Abrir {title} →
              </a>
            </div>
          )}

          {/* iframe */}
          <iframe
            ref={iframeRef}
            src={isOpen ? url : ""}
            title={title}
            className={`lpm-iframe ${iframeState === "ready" ? "lpm-iframe--visible" : ""}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="fullscreen"
            loading="lazy"
          />
        </div>

        {/* ── Status bar ── */}
        <footer className="lpm-statusbar">
          <span className="lpm-status-dot" data-state={iframeState} aria-hidden="true"/>
          <span className="lpm-status-text">
            {iframeState === "loading" && "Aguardando resposta do servidor..."}
            {iframeState === "ready"   && `${title} — ao vivo`}
            {iframeState === "blocked" && "Acesso direto necessário"}
          </span>
          <span className="lpm-status-hint">ESC para fechar</span>
        </footer>

      </div>
    </div>,
    document.body
  );
};

export default LivePreviewModal;