import React from "react";
import "../styles/sidebar.css";

const Sidebar = ({ isMobile, isOpen }) => {

  // O "motor" que faz o download do arquivo que está na pasta public
  const handleDownloadLocal = () => {
    const link = document.createElement("a");
    link.href = "/curriculo_Bruno_Fraga.pdf"; // Nome do seu arquivo na pasta public
    link.download = "curriculo_Bruno_Fraga.pdf"; // Nome que vai salvar no PC da pessoa
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <aside className={isMobile ? `sidebar-mobile ${isOpen ? "open" : ""}` : "sidebar"}>
      <img
        src="/imgperfil.png"
        alt="Profile"
        className="profile-pic"
      />
      <h2>Bruno Fraga</h2>
      <p>Desenvolvedor Backend Java</p>
      <div className="contact-info">
        <p>Email: brunofragaa97@gmail.com</p>
        <p>Florianopolis, Santa Catarina, Brasil</p>
        <p>Telefone: (51) 98904-3802</p>
      </div>

      {/* SEU BOTÃO ORIGINAL INTACTO: Adicionamos apenas o onClick */}
      <button className="btn1" onClick={handleDownloadLocal}>
        Baixar Curriculum
      </button>

      <div className="img-qr-code">
        <img src="https://imgur.com/r6LylG9.png" alt="QR Code" referrerPolicy="no-referrer" />
      </div>
      <div className="redes-icons">
        <a
          href="https://www.linkedin.com/in/bruno-fraga-dev/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/2048px-LinkedIn_icon.svg.png"
            alt="LinkedIn"
          />
        </a>

        <a
          href="https://github.com/brunofdev"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg"
            alt="GitHub"
          />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;