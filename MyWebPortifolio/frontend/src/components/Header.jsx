import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = ({ isAuthenticated, userName, handleLogout, openAuthModal, openEditProfile, goHome }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Detecta rolagem da página
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IMAGEM FAKE PADRÃO (Silhueta)
  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

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
            <button 
              className="nav-link btn-home" 
              onClick={() => {
                if (goHome) goHome(); 
                setIsMenuOpen(false); 
              }}
            >
              Home
            </button>
            <a href="#about" className="nav-link" onClick={() => setIsMenuOpen(false)}>Sobre</a>
            <a href="#skills" className="nav-link" onClick={() => setIsMenuOpen(false)}>Habilidades</a>
            <a href="#projects" className="nav-link" onClick={() => setIsMenuOpen(false)}>Projetos</a>
            <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contato</a>
            <a href="#feedback" className="nav-link" onClick={() => setIsMenuOpen(false)}>Deixe seu Feedback</a>
          </div>

          <div className="nav-footer">
            {isAuthenticated && userName ? (
              <>
                {/* AQUI ESTÁ A FOTO E NOME DENTRO DO MENU MOBILE */}
                <div className="mobile-user-profile">
                  <img src={defaultAvatar} alt="Perfil" className="header-avatar" />
                  <span>Olá, <strong>{userName}</strong></span>
                </div>
                
                <button className="nav-auth-button" onClick={() => { openEditProfile(); setIsMenuOpen(false); }}>
                  Editar Perfil
                </button>
                <button className="nav-auth-button logout" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                  Sair
                </button>
              </>
            ) : (
              <button className="nav-auth-button" onClick={() => { openAuthModal(); setIsMenuOpen(false); }}>
                Entrar
              </button>
            )}
            <span className="nav-footer-text">© 2026 BrunoFraga.dev</span>
          </div>
        </nav>

        {/* DIREITA (COM O NOVO DROPDOWN E AVATAR) */}
        {/* Adicionamos a classe 'hide-on-mobile' que é ativada quando o menu abre */}
        <div className={`right-section ${isMenuOpen ? "hide-on-mobile" : ""}`}>
          {isAuthenticated && userName ? (
            <div className="user-menu-container">
              <button className="user-menu-button" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <img src={defaultAvatar} alt="Perfil" className="header-avatar" />
                <span className="user-menu-name">Olá, <strong>{userName}</strong> ▼</span>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <button className="dropdown-item" onClick={() => { openEditProfile(); setIsUserMenuOpen(false); }}>
                    Editar Perfil
                  </button>
                  <button className="dropdown-item logout" onClick={() => { handleLogout(); setIsUserMenuOpen(false); }}>
                    Sair / Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="auth-button" onClick={openAuthModal}>Entrar</button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;