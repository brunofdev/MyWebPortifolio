import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = ({ isAuthenticated, userName, handleLogout, openAuthModal }) => {
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
  <div className="nav-header">
    <span className="nav-title">Bruno Dev</span>
    <span className="nav-subtitle">Full Stack Developer</span>
    <div className="nav-divider" />
  </div>

  <div className="nav-links">
    <a href="#about" className="nav-link">Sobre</a>
    <a href="#experience" className="nav-link">Experiência</a>
    <a href="#skills" className="nav-link">Habilidades</a>
    <a href="#projects" className="nav-link">Projetos</a>
    <a href="#contact" className="nav-link">Contato</a>
  </div>

  <div className="nav-footer">
  {isAuthenticated && userName ? (
    <span className="welcome-text">
      Bem-vindo, <strong>{userName}</strong>!
    </span>
  ) : (
    <button
      className="nav-auth-button"
      onClick={() => {
        openAuthModal();
        setIsMenuOpen(false);
      }}
    >
      Entrar
    </button>
  )}

  {isAuthenticated && (
    <button
      className="nav-auth-button"
      onClick={() => {
        handleLogout();
        setIsMenuOpen(false);
      }}
    >
      Sair
    </button>
  )}

  <span className="nav-footer-text">© 2026 BrunoFraga.dev</span>
</div>
</nav>

  {/* DIREITA */}
  <div className="right-section">
  {isAuthenticated && userName && (
    <span className="welcome-text">
      Bem-vindo, <strong>{userName}</strong>!
    </span>
  )}

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