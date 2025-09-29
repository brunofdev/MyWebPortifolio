import React, { useState, useEffect } from "react";
import "../styles/header.css";

// Componente Header recebe props para gerenciar autenticação
const Header = ({ isAuthenticated, handleLogin, handleLogout, openAuthModal }) => {
  // Estado para controlar se o menu está aberto
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para verificar se a página foi rolada
  const [isScrolled, setIsScrolled] = useState(false);
  // Estado para o botão de ligar motores: idle (inativo), loading (ligando), success (motores ligados), error502or500 (erro 502 ou 500)
  const [buttonState, setButtonState] = useState("idle");
  // Estado para controlar a visibilidade do ícone de foguete
  const [rocketVisible, setRocketVisible] = useState(false);

  // Efeito para detectar rolagem da página
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efeito para animação do foguete quando os motores estão ligados
  useEffect(() => {
    if (buttonState === "success") {
      const interval = setInterval(() => {
        setRocketVisible((prev) => !prev);
      }, 500);
      // Limpa o console do navegador quando os motores estão ligados
      console.clear();
      return () => clearInterval(interval);
    }
  }, [buttonState]);

  // Efeito para retentativas automáticas em caso de erro 502 ou 500
  useEffect(() => {
    let interval;
    if (buttonState === "error502or500") {
      interval = setInterval(() => {
        handleEngineStart(true); // Tenta novamente sem mudar para "loading"
      }, 5000); // Tenta a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [buttonState]);

  // Função para iniciar os motores (chamar as APIs)
  const handleEngineStart = async (isRetry = false) => {
    // Não faz novas requisições se os motores já estão ligados
    if (buttonState === "success") return;
    if (!isRetry) {
      setButtonState("loading"); // Muda para "ligando" na primeira tentativa
    }

    // Lista de endpoints das APIs
    const endpoints = [
      "https://user-service-tj9w.onrender.com/api/users/register",
      "https://authservice-5f3d.onrender.com/api/auth/login",
      "https://apigateway-qao8.onrender.com/api/auth/login",
    ];

    try {
      // Faz requisições simultâneas para todas as APIs
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

      // Verifica se há erro 502 ou 500
      const has502or500 = responses.some(
        (res) => res.status === 502 || res.status === 500
      );
      // Verifica se todas as requisições falharam (ex.: erro de CORS)
      const allFailed = responses.every((res) => !res.ok && res.status === null);
      // Verifica se há algum erro que não seja 502 ou 500
      const hasNon502or500Error = responses.some(
        (res) => res.status && res.status !== 502 && res.status !== 500
      );

      if (hasNon502or500Error) {
        setButtonState("success"); // Motores ligados se houver qualquer resposta que não seja 502/500
      } else if (has502or500 || allFailed) {
        setButtonState("error502or500"); // Continua tentando em caso de erro 502/500 ou falha geral
      } else {
        setButtonState("idle"); // Volta ao estado inicial se nenhuma condição for atendida
      }
    } catch (error) {
      setButtonState("error502or500"); // Qualquer erro inesperado (incluindo CORS) mantém estado de retry
    }
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        {/* Botão hamburguer para menu mobile */}
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

        {/* Botão Ligar Motores com Notificação */}
        <div className="engine-button-container">
          <button
            className={`engine-button ${
              buttonState === "error502or500" || buttonState === "loading"
                ? "error502or500"
                : buttonState === "success"
                ? "success"
                : ""
            }`}
            onClick={() => handleEngineStart(false)}
            disabled={buttonState === "loading" || buttonState === "error502or500" || buttonState === "success"}
            title="Este botão serve para 'acordar' nossos serviços, pois como utilizamos plataformas com planos gratuitos, os serviços ficam adormecidos quando inutilizados e demoram cerca de 1 ou 2 minutos para estarem em funcionamento."
          >
            {buttonState === "loading" || buttonState === "error502or500" ? (
              <>
                Ligando <span role="img" aria-label="cara de mal">😣</span>
              </>
            ) : buttonState === "success" ? (
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
        </div>

        {/* Botão Login/Cadastre-se ou Sair */}
        <div className="auth-button-container">
          <button
            className="auth-button"
            onClick={isAuthenticated ? handleLogout : openAuthModal}
          >
            {isAuthenticated ? "Sair" : "Login/Cadastre-se"}
          </button>
        </div>

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