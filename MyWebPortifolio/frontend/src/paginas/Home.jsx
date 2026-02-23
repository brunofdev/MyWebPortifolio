import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import About from "../components/About";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import AuthModal from "../components/auth/AuthModal";
import Modal from "../components/Modal";
import ModalApresentacao from "../components/ModalApresentacao";
import Feedback from "../components/Feedback";
import FeedbackList from "../components/FeedbackList";
import MatrixBackground from "../components/MatrixBackground";
import EditProfile from "../components/EditProfile";
import "../styles/global.css";
import "../styles/home.css";

const Home = () => {
  const [activeModalContent, setActiveModalContent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [openAdminPanel, setOpenAdminPanel] = useState(false); // AJUSTE: Novo estado para a foto

  const [currentView, setCurrentView] = useState("home"); 

  useEffect(() => {
    setActiveModalContent(1); 
  }, []);

  const closeModal = () => setActiveModalContent(null);
  const openAuthModal = () => setActiveModalContent("auth");
  const navigate = useNavigate();

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setToken(data.token);
    setUserRole(data.user.role);
    setUserName(data.user.userName);
    setUserPhoto(data.user.fotoPerfil); // AJUSTE: Salva a foto que vem do login
    closeModal();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserRole(null);
    setUserName(null);
    setUserPhoto(null); // AJUSTE: Limpa a foto ao sair
    goHome(); 
  };

  const handleAdminNavigation = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Você precisa estar logado!");
    return;
  }

  // Coloque um estado de "loading" no botão se quiser, para o usuário saber que está pensando
  try {
    // Vamos bater em um endpoint do seu Java que SÓ aceita ADMIN3
    const response = await fetch(import.meta.env.VITE_API_URL + "/auth/validar-admin", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      // O Java disse OK (Status 200). A catraca abriu!
      setIsMenuOpen(false);
      navigate('/admin');
    } else {
      // O Java barrou (Status 403 Forbidden ou 401 Unauthorized)
      alert("Acesso negado: Tentativa de fraude detectada ou sem permissão.");
      // Opcional: handleLogout() para deslogar o espertinho na hora
    }
  } catch (error) {
    console.error("Erro ao validar:", error);
    alert("Servidor indisponível no momento.");
  }
};
  // AJUSTE: Função para atualizar a foto no Header após editar o perfil
  const handleUpdateUserPhoto = (newPhotoUrl) => {
    setUserPhoto(newPhotoUrl);
  };

  const openEditProfile = () => {
    setCurrentView("editProfile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHome = () => {
    setCurrentView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "editProfile":
        return (
          <EditProfile 
            onClose={goHome} 
            userName={userName} 
            token={token} 
            onUpdateSuccess={handleUpdateUserPhoto} // Passamos a função de atualização
          />
        );
      
      case "home":
      default:
        return (
          <>
            <section className="section-about" id="about"><About /></section>
            <hr className="separator" />
            <section id="skills"><Skills /></section>
            <hr className="separator" />
            <section id="projects"><Projects /></section>
            <hr className="separator" />
            <section id="contact"><Contact /></section>
            <hr className="separator" />
            <section id="feedback">
              <Feedback isAuthenticated={isAuthenticated} token={token} openAuthModal={openAuthModal} />
            </section>
            <hr className="separator" />
            <section id="feedbackList">
              <FeedbackList userRole={userRole} token={token} />
            </section>
          </>
        );
    }
  };

  return (
    <div className="container">
      <MatrixBackground />
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userPhoto={userPhoto}
        userRole={userRole}
        openAdminPanel={openAdminPanel}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
        openEditProfile={openEditProfile}
        goHome={goHome}
      />
      
      <div className="content">
        <Modal isOpen={activeModalContent === 1} onClose={closeModal}>
          <ModalApresentacao onClose={closeModal} />
        </Modal>
        <Modal isOpen={activeModalContent === "auth"} onClose={closeModal}>
          <AuthModal handleLoginSuccess={handleLogin} onClose={closeModal} />
        </Modal>

        <Sidebar />
        
        <main className="main-content">
          <div className="main-container">
            {renderMainContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Home;