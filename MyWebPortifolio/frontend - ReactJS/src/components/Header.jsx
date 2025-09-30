import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = ({ isAuthenticated, handleLogin, handleLogout, openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [engineState, setEngineState] = useState("loading"); // Changed from buttonState to engineState

  // Effect to start engines automatically on mount
  useEffect(() => {
    handleEngineStart();
  }, []);

  // Effect for scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for retry attempts on 502 or 500 errors
  useEffect(() => {
    let interval;
    if (engineState === "error") {
      interval = setInterval(() => {
        handleEngineStart(true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [engineState]);

  // Function to start engines
  const handleEngineStart = async (isRetry = false) => {
    if (engineState === "success") return;
    if (!isRetry) {
      setEngineState("loading");
    }

    const endpoints = [
      "https://apigateway-qao8.onrender.com/api/auth/login",
      "https://user-service-tj9w.onrender.com/api/users/register",
      "https://authservice-5f3d.onrender.com/api/auth/login",
      "https://processador-feedbacks.onrender.com/api/processfeedback/createfeedback"
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
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
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
              <span className="blink">Motores Ligados</span>
            )}
          </div>
        </div>

        <div className="auth-button-container">
          <button
            className="auth-button"
            onClick={isAuthenticated ? handleLogout : openAuthModal}
          >
            {isAuthenticated ? "Sair" : "Login/Cadastre-se"}
          </button>
        </div>

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
            Skills
          </a>
          <a href="#projects" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Projetos
          </a>
          <a href="#contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;