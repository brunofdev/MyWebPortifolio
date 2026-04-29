import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // 👈 useNavigate importado!
import { useAuth } from "../contexts/AuthContext";
import Header from "./compartilhado/header/Header";
import Footer from "./compartilhado/footer/Footer";
import AuthModal from "./auth/AuthModal";
import Modal from "./Modal";
import "../styles/mainlayout.css";

const MainLayout = () => {
  const {
    isAuthenticated, userName, userPhoto, userRole, token,
    handleLogin, handleLogout
  } = useAuth();

  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openEditProfile = () => {
    navigate("/editar-perfil");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (data) => {
    handleLogin(data);
    closeAuthModal();
  };

  const handleAdminNavigation = async (e) => {
    e.preventDefault();
    if (!token) return alert("Você precisa estar logado!");
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/auth/validar-admin", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) navigate('/admin');
      else alert("Acesso negado.");
    } catch (error) {
      alert("Servidor indisponível no momento.");
    }
  };

  return (
    <div className="layout-wrapper">
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userPhoto={userPhoto}
        userRole={userRole}
        handleLogin={handleLoginSuccess}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
        handleAdminNavigation={handleAdminNavigation}
        openEditProfile={openEditProfile}
      />
      {/* Se o modal for aberto, ele aparece por cima de qualquer tela */}
      {isAuthModalOpen && (
        <AuthModal
          handleLoginSuccess={handleLoginSuccess}
          onClose={closeAuthModal}
        />
      )}

      <main className="layout-main-content">
        <Outlet context={{ openAuthModal }} />
      </main>
      <Footer />
    </div>

  );

};



export default MainLayout;