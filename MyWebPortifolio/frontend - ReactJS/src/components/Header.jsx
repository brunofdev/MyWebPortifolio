import React, { useState, useEffect } from "react";
import "../styles/header.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [buttonState, setButtonState] = useState("idle"); // idle, loading, error502or500, error403
  const [rocketVisible, setRocketVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (buttonState === "error403") {
      const interval = setInterval(() => {
        setRocketVisible((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [buttonState]);

  useEffect(() => {
    let interval;
    if (buttonState === "error502or500") {
      interval = setInterval(() => {
        handleEngineStart(true); // Chama a função sem alterar o estado para "loading"
      }, 5000); // Tenta novamente a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [buttonState]);

  const handleEngineStart = async (isRetry = false) => {
    if (!isRetry) {
      setButtonState("loading");
    }
    const endpoints = [
      "https://user-service-tj9w.onrender.com/api/users/register",
      "https://authservice-5f3d.onrender.com/api/auth/login",
      "https://apigateway-qao8.onrender.com/api/auth/login",
    ];

    try {
      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          })
        )
      );

      const has403 = responses.some((res) => res.status === 403);
      const has502or500 = responses.some(
        (res) => res.status === 502 || res.status === 500
      );

      if (has403) {
        setButtonState("error403");
      } else if (has502or500) {
        setButtonState("error502or500");
      } else {
        setButtonState("idle");
      }
    } catch (error) {
      setButtonState("error502or500");
    }
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Botão hamburguer */}
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

        {/* Botão Ligar Motores */}
        <button
          className={`engine-button ${
            buttonState === "error502or500" || buttonState === "loading"
              ? "error502or500"
              : buttonState === "error403"
              ? "error403"
              : ""
          }`}
          onClick={() => handleEngineStart(false)}
          disabled={buttonState === "loading" || buttonState === "error502or500"}
        >
          {(buttonState === "loading" || buttonState === "error502or500") ? (
            <>
              Ligando Motores <span role="img" aria-label="cara de mal">😣</span>
            </>
          ) : buttonState === "error403" ? (
            <>
              Motores Ligados{" "}
              <span
                role="img"
                aria-label="foguete"
                style={{ visibility: rocketVisible ? "visible" : "hidden" }}
              >
                🚀
              </span>
            </>
          ) : (
            "Ligar Motores"
          )}
        </button>

        {/* Menu de navegação */}
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