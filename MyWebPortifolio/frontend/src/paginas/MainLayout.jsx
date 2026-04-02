// src/components/MainLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import AuthModal from "./auth/AuthModal";
import Modal from "./Modal";

const MainLayout = () => {
  const { 
    isAuthenticated, userName, userPhoto, userRole, token, 
    handleLogin, handleLogout 
  } = useAuth(); 

  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  
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
    // 👉 RESTAURADO: Sua classe original "container"
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
      />

      <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal}>
        <AuthModal handleLoginSuccess={handleLoginSuccess} onClose={closeAuthModal} />
      </Modal>

      {/* 👉 O Outlet substitui o "miolo" da página */}
      <Outlet /> 

      <Footer />
    </div>
  );
};

export default MainLayout;