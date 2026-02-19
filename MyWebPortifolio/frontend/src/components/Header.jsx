import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = ({ isAuthenticated, handleLogin, handleLogout, openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detecta rolagem da página
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
          {isMenuOpen && (
            <button
              className="close-menu"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Fechar menu"
            >
              ✕
            </button>
          )}
          <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Sobre
          </a>
          <a href="#experience" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Experiência
          </a>
          <a href="#skills" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Habilidades
          </a>
          <a href="#projects" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Projetos
          </a>
          <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Contato
          </a>
        </nav>

        <div className="right-section">
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="28"
              height="28"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5h18M3 12h18M3 19h18"
              />
            </svg>
          </button>

          <div className="auth-button-container">
            <button
              className="auth-button"
              onClick={isAuthenticated ? handleLogout : openAuthModal}
            >
              {isAuthenticated ? "Sair" : "Entrar/Cadastrar"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;