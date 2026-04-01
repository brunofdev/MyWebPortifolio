import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MatrixBackground from "../components/MatrixBackground";
import ManageProjects from "../components/paineladm/ManageProjects";
// 🚨 MUDANÇA AQUI: Importando o Pai (ManageArticles) em vez do Filho
import ManageArticles from "../components/paineladm/ManageArticles"; 
import "../styles/admindashboard.css";

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState("projetos");
  const navigate = useNavigate();

  // 1. LÊ A CARTEIRA DO NAVEGADOR
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 2. RECUPERA OS DADOS
  const isAuthenticated = !!token;
  const userRole = user ? user.role : null;
  const userName = user ? user.userName : "Admin";
  const userPhoto = user ? user.fotoPerfil : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const goHome = () => {
    navigate("/"); // Volta para a Home sem perder o login!
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Trava de Segurança Extra
  if (!isAuthenticated || userRole !== "ADMIN3") {
    return (
      <div className="admin-access-denied">
        <h2>🚫 Acesso Restrito</h2>
        <p>Você não tem permissão para acessar esta área.</p>
        <button onClick={goHome}>Voltar para o Início</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <MatrixBackground />
      
      {/* NOVA TOPBAR EXCLUSIVA DO ADMIN */}
      <header className="admin-topbar">
        <div className="topbar-left">
          <span className="admin-brand">⚙️ Painel de Controle</span>
        </div>
        
        <div className="topbar-right">
          <div className="admin-user-info">
            <img src={userPhoto} alt="Admin Profile" className="admin-avatar" />
            <span className="admin-name">Olá, {userName}</span>
          </div>
          
          <div className="topbar-actions">
            <button className="btn-topbar primary" onClick={goHome}>
              🏠 Voltar ao Site
            </button>
            <button className="btn-topbar danger" onClick={handleLogout}>
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        {/* MENU LATERAL DO PAINEL */}
        <aside className="admin-sidebar">
          <h2 className="admin-sidebar-title">Navegação</h2>
          <ul className="admin-menu">
            <li 
              className={activeModule === "projetos" ? "active" : ""}
              onClick={() => setActiveModule("projetos")}
            >
              Gerenciar Projetos
            </li>
            <li 
              className={activeModule === "artigos" ? "active" : ""}
              onClick={() => setActiveModule("artigos")}
            >
               Gerenciar Artigos
            </li>
          </ul>
        </aside>

        {/* ÁREA DE TRABALHO */}
        <main className="admin-workspace">
          {activeModule === "projetos" && (
            <div className="admin-module">
              <h1>Meus Projetos</h1>
              <p>Aqui você poderá adicionar, editar e excluir os projetos do portfólio.</p>
              <ManageProjects />
            </div>
          )}

          {activeModule === "artigos" && (
            <div className="admin-module" style={{ padding: "0" }}>
              <ManageArticles />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;