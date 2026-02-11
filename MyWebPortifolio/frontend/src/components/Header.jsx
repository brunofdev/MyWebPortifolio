import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = ({ isAuthenticated, handleLogin, handleLogout, openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [engineState, setEngineState] = useState("loading");

  // Inicia os motores automaticamente ao montar o componente
  useEffect(() => {
    handleEngineStart();
  }, []);

  // Detecta rolagem da página
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tenta novamente em caso de erros 502 ou 500
  useEffect(() => {
    let interval;
    if (engineState === "error") {
      interval = setInterval(() => {
        handleEngineStart(true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [engineState]);

  // Função para iniciar os motores
  const handleEngineStart = async (isRetry = false) => {
    if (engineState === "success") return;
    if (!isRetry) {
      setEngineState("loading");
    }

    const endpoints = [
      "https://apigateway-kgvz.onrender.com/api/auth/login",
      "https://user-service-9qaj.onrender.com/api/users/register",
      "https://authservice-kbrd.onrender.com/api/auth/login",
      "https://processador-feedbacks-72fc.onrender.com/api/processfeedback/createfeedback",
      "https://mailservice-sgte.onrender.com/health"
    ];

    try {
      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
            mode: "cors",
          }).then((res) => ({ status: res.status, ok: res.ok }))
            .catch(() => ({ status: null, ok: false }))
        )
      );

      const has502or500 = responses.some(
        (res) => res.status === 502 || res.status === 500
      );
      const allFailed = responses.every((res) => !res.ok && res.status === null);
      const hasNon502or500Error = responses.some(
        (res) => res.status && res.status !== 502 && res.status !== 500
      );

      if (hasNon502or500Error) {
        setEngineState("success");
        console.clear();
      } else if (has502or500 || allFailed) {
        setEngineState("error");
      } else {
        setEngineState("loading");
      }
    } catch (error) {
      setEngineState("error");
    }
  };

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

          <div className="engine-status-container">
            <div className={`engine-status ${engineState}`}>
              {engineState === "loading" || engineState === "error" ? (
                <>
                  <div className="loader"></div>
                  <span>Ligando Motores</span>
                </>
              ) : (
                <>
                  <span className="blink">Motores Ligados</span>
                  <span className="tooltip">
                    Este botão ativa os serviços hospedados gratuitamente, que ficam adormecidos quando não recebem requisições.
                  </span>
                </>
              )}
            </div>
          </div>

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