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

  {/* BOTÃO MENU (ESQUERDA NO MOBILE) */}
  <button
    className="menu-toggle"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    aria-label="Abrir menu"
  >
    ☰
  </button>

  {/* NAVEGAÇÃO */}
  <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
  {/* HEADER */}
  <div className="nav-header">
    <span className="nav-title">Bruno Dev</span>

  </div>

  <div className="nav-divider" />

  {/* LINKS */}
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

  {/* FOOTER DO MENU */}
  <div className="nav-footer">
    <button
      className="nav-auth-button"
      onClick={() => {
        setIsMenuOpen(false);
        isAuthenticated ? handleLogout() : openAuthModal();
      }}
    >
      {isAuthenticated ? "Sair" : "Entrar"}
    </button>

    <span className="nav-footer-text">
      © {new Date().getFullYear()} Bruno Dev
    </span>
  </div>
</nav>

  {/* DIREITA */}
  <div className="right-section">
    <button
      className="auth-button"
      onClick={isAuthenticated ? handleLogout : openAuthModal}
    >
      {isAuthenticated ? "Sair" : "Entrar"}
    </button>
  </div>

</div>
    </header>
  );
};

export default Header;