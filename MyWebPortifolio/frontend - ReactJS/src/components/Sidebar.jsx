import React from "react";
import "../styles/sidebar.css";


const Sidebar = ({ isMobile, isOpen }) => {
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
      <button className="btn1">Baixar Curriculum</button>
      <div className="img-qr-code">
        <img src="https://imgur.com/r6LylG9.png" alt="QR Code" referrerPolicy="no-referrer" />
      </div>
      <div className="redes-icons">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/2048px-LinkedIn_icon.svg.png" />
        <img src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg" />
      </div>
    </aside>
  );
};

export default Sidebar;