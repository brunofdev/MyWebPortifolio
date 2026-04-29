// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import "../../styles/sidebar.css";

const Sidebar = ({ isMobile, isOpen }) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleDownloadLocal = () => {
    const link = document.createElement("a");
    link.href = "/curriculo_Bruno_Fraga.pdf";
    link.download = "curriculo_Bruno_Fraga.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("brunofragaa97@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stack = [
    "Java 17+", "Spring Boot", "Clean Architecture", "DDD",
    "REST APIs", "PostgreSQL", "Docker", "AWS", "React", "Git",
  ];

  return (
    <aside className={`sdb ${isMobile ? "sdb--mobile" : ""} ${isOpen ? "sdb--open" : ""} ${visible ? "sdb--visible" : ""}`}>

      {/* ── Linha de acento superior ── */}
      <div className="sdb-accent-bar" />

      {/* ══ 1. PROFILE HERO ══ */}
      <div className="sdb-hero">
        <div className="sdb-avatar-ring">
          <div className="sdb-avatar-ring-inner">
            <img src="/imgperfil.png" alt="Bruno Fraga" className="sdb-avatar" />
          </div>
          {/* Status badge */}
          <div className="sdb-status-badge" title="Disponível para oportunidades">
            <span className="sdb-status-dot" />
          </div>
        </div>

        <div className="sdb-identity">
          <h2 className="sdb-name">Bruno Fraga</h2>
          <div className="sdb-title-row">
            <span className="sdb-title-bracket">&lt;</span>
            <span className="sdb-title">Backend Developer</span>
            <span className="sdb-title-bracket">/&gt;</span>
          </div>

        </div>
      </div>

      {/* ══ 2. STACK CHIPS ══ */}
      <div className="sdb-stack-section">
        <p className="sdb-section-label">Stack principal</p>
        <div className="sdb-stack">
          {stack.map(tech => (
            <span key={tech} className="sdb-chip">{tech}</span>
          ))}
        </div>
      </div>



      {/* ══ 4. CONTATO ══ */}
      <div className="sdb-contact">
        <p className="sdb-section-label">Contato</p>

        <button className="sdb-contact-row sdb-contact-row--btn" onClick={handleCopyEmail} title="Clique para copiar">
          <span className="sdb-contact-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </span>
          <span className="sdb-contact-text">
            {copied ? "✓ Copiado!" : "brunofragaa97@gmail.com"}
          </span>
          {!copied && (
            <span className="sdb-copy-hint">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </span>
          )}
        </button>

        <div className="sdb-contact-row">
          <span className="sdb-contact-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <span className="sdb-contact-text">Florianópolis, SC — Brasil</span>
        </div>

        <div className="sdb-contact-row">
          <span className="sdb-contact-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <span className="sdb-contact-text">(51) 98904-3802</span>
        </div>
      </div>

      {/* ══ 5. CTA — DOWNLOAD ══ */}
      <button className="sdb-download-btn" onClick={handleDownloadLocal}>
        <span className="sdb-download-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </span>
        <span className="sdb-download-text">
          <strong>Baixar Currículo</strong>
          <small>PDF · Atualizado 2026</small>
        </span>
        <span className="sdb-download-arrow">→</span>
      </button>

      {/* ══ 6. SOCIAL LINKS ══ */}
      <div className="sdb-socials">
        <a
          className="sdb-social-btn sdb-social-btn--linkedin"
          href="https://www.linkedin.com/in/bruno-fraga-dev/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          LinkedIn
        </a>

        <a
          className="sdb-social-btn sdb-social-btn--github"
          href="https://github.com/brunofdev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
          GitHub
        </a>
      </div>

      {/* ══ 7. QR CODE ══ */}
      <div className="sdb-qr">
        <p className="sdb-section-label">Escaneie para conectar</p>
        <div className="sdb-qr-wrapper">
          <img
            src="https://imgur.com/r6LylG9.png"
            alt="QR Code — LinkedIn Bruno Fraga"
            referrerPolicy="no-referrer"
          />
          <span className="sdb-qr-label">QR CODE WHATSAPP</span>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
