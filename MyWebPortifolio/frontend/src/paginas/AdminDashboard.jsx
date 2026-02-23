import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MatrixBackground from "../components/MatrixBackground";
import "../styles/adminDashboard.css";

// 👇 Removemos as props que vinham vazias
const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState("projetos");
  const navigate = useNavigate();

  // 1. LÊ A CARTEIRA DO NAVEGADOR (Puxa o crachá guardado)
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 2. RECUPERA OS DADOS
  const isAuthenticated = !!token; // Se tem token, tá logado (true)
  const userRole = user ? user.role : null;
  const userName = user ? user.userName : "Admin";
  const userPhoto = user ? user.fotoperfil : null;

  const goHome = () => {
    navigate("/");
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
        <h2>Acesso Restrito</h2>
        <p>Você não tem permissão para acessar esta área.</p>
        <p>Sua role atual: {userRole || "Nenhuma (Não logado)"}</p>
        <button onClick={goHome}>Voltar para o Início</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <MatrixBackground />
      
      {/* Reaproveitamos o seu Header para o painel não perder a identidade */}
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userPhoto={userPhoto}
        userRole={userRole}
        handleLogout={() => {
          handleLogout();
          goHome(); // Desloga e expulsa da sala admin
        }}
        goHome={goHome}
      />

      <div className="admin-layout">
        {/* MENU LATERAL DO PAINEL */}
        <aside className="admin-sidebar">
          <h2 className="admin-sidebar-title">Painel de Controle</h2>
          <ul className="admin-menu">
            <li 
              className={activeModule === "projetos" ? "active" : ""}
              onClick={() => setActiveModule("projetos")}
            >
              🚀 Gerenciar Projetos
            </li>
            <li 
              className={activeModule === "artigos" ? "active" : ""}
              onClick={() => setActiveModule("artigos")}
            >
              📝 Gerenciar Artigos
            </li>
          </ul>
        </aside>

        {/* ÁREA DE TRABALHO (Onde os formulários vão aparecer) */}
        <main className="admin-workspace">
          {activeModule === "projetos" && (
            <div className="admin-module">
              <h1>Meus Projetos</h1>
              <p>Aqui você poderá adicionar, editar e excluir os projetos do portfólio.</p>
              {/* No futuro: <ManageProjects /> */}
              <div className="placeholder-box">Área do Formulário de Projetos (Em breve)</div>
            </div>
          )}

          {activeModule === "artigos" && (
            <div className="admin-module">
              <h1>Artigos do Blog</h1>
              <p>Área reservada para criar publicações técnicas.</p>
              <div className="placeholder-box">Área do Editor de Textos (Em breve)</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;