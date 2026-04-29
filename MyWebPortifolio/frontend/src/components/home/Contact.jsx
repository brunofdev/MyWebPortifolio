import React, { useState } from "react";
import "../../styles/contact.css";

const links = [
  {
    key: "email",
    href: "mailto:brunofragaa97@gmail.com",
    label: "brunofragaa97@gmail.com",
    sublabel: "Respondo em até 24h",
    colorClass: "contact-card--green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3"/>
        <polyline points="2,4 12,13 22,4"/>
      </svg>
    ),
  },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/bruno-fraga-dev/",
    label: "linkedin.com/in/bruno-fraga-dev",
    sublabel: "Aberto a oportunidades",
    colorClass: "contact-card--blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    key: "github",
    href: "https://github.com/brunofdev",
    label: "github.com/brunofdev",
    sublabel: "Projetos & código aberto",
    colorClass: "contact-card--gray",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
];

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText("brunofragaa97@gmail.com").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-header">
        <span className="contact-eyebrow">// vamos conversar</span>
        <h2 className="contact-title">
          Pronto para o seu <span className="contact-title-accent">próximo projeto?</span>
        </h2>
        <p className="contact-subtitle">
          Estou disponível para novas oportunidades, projetos freelance ou só uma boa conversa sobre arquitetura de software.
        </p>
      </div>

      <div className="contact-cards">
        {links.map((link) => {
          const isEmail = link.key === "email";
          return (
            <a
              key={link.key}
              href={link.href}
              className={`contact-card ${link.colorClass}`}
              target={isEmail ? undefined : "_blank"}
              rel={isEmail ? undefined : "noopener noreferrer"}
              onClick={isEmail ? handleCopyEmail : undefined}
            >
              <div className="contact-card-icon">{link.icon}</div>
              <div className="contact-card-body">
                <span className="contact-card-label">
                  {isEmail && copied ? "✓ Copiado!" : link.label}
                </span>
                <span className="contact-card-sub">
                  {isEmail
                    ? copied
                      ? "Email copiado para a área de transferência"
                      : "Clique para copiar o email"
                    : link.sublabel}
                </span>
              </div>
              <div className="contact-card-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </a>
          );
        })}
      </div>

      <div className="contact-footer">
        <div className="contact-status">
          <span className="contact-status-dot" />
          <span className="contact-status-text">Disponível para novas oportunidades em 2026</span>
        </div>
        <span className="contact-footer-mono">response_time &lt; 24h</span>
      </div>
    </section>
  );
};

export default Contact;