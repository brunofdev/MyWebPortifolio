// Home.jsx
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

// ==========================================
// UTILS: Validação de Expiração do JWT
// ==========================================
const isTokenValid = (token) => {
  try {
    // O payload é a segunda parte do token (índice 1)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // O 'exp' está em segundos. Multiplicamos por 1000 para virar milissegundos
    const expirationTime = payload.exp * 1000; 
    
    // Retorna true se a hora atual for MENOR que a hora de expiração
    return Date.now() < expirationTime;
  } catch (error) {
    // Se der qualquer erro ao ler (token corrompido, vazio, etc), consideramos inválido
    return false; 
  }
};

const Home = () => {
  const [activeModalContent, setActiveModalContent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [openAdminPanel, setOpenAdminPanel] = useState(false);

  const [currentView, setCurrentView] = useState("home"); 
  const navigate = useNavigate();

  // ==========================================
  // INICIALIZAÇÃO E RECUPERAÇÃO DE SESSÃO
  // ==========================================
  useEffect(() => {
    setActiveModalContent(1); 
    
    const savedToken = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));
    
    if (savedToken && savedUser) {
      // 🛡️ TRAVA ZUMBI: Valida se o tempo da pulseira ainda não acabou
      if (isTokenValid(savedToken)) {
        setIsAuthenticated(true);
        setToken(savedToken);
        setUserRole(savedUser.role);
        setUserName(savedUser.userName);
        setUserPhoto(savedUser.fotoPerfil);
      } else {
        // 🧹 Limpa os dados velhos se o token expirou (Logout Silencioso)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setToken(null);
      }
    }
  }, []);

  const closeModal = () => setActiveModalContent(null);
  const openAuthModal = () => setActiveModalContent("auth");

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setToken(data.token);
    setUserRole(data.user.role);
    setUserName(data.user.userName);
    setUserPhoto(data.user.fotoPerfil);
    closeModal();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserRole(null);
    setUserName(null);
    setUserPhoto(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    goHome(); 
  };

  const handleAdminNavigation = async (e) => {
    e.preventDefault();
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Você precisa estar logado!");
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/auth/validar-admin", {
        method: "GET",
        headers: { "Authorization": `Bearer ${currentToken}` }
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        alert("Acesso negado: Tentativa de fraude detectada ou sem permissão.");
      }
    } catch (error) {
      console.error("Erro ao validar:", error);
      alert("Servidor indisponível no momento.");
    }
  };

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
    if (currentView === "editProfile") {
      return (
        <EditProfile 
          onClose={goHome} 
          userName={userName} 
          token={token} 
          onUpdateSuccess={handleUpdateUserPhoto} 
        />
      );
    }

    return (
      <>
        <section className="section-about" id="about"><About /></section>
        <hr className="separator" />
        
        <section className="section-skills" id="skills"><Skills /></section>
        <hr className="separator" />
        
        <section className="section-projects" id="projects">
          <Projects 
            token={token} 
            userName={userName} 
            userRole={userRole} 
          />
        </section>
        <hr className="separator" />
        
        <section className="section-contact" id="contact"><Contact /></section>
        <hr className="separator" />
        
        <section className="section-feedback" id="feedback">
          <Feedback isAuthenticated={isAuthenticated} token={token} openAuthModal={openAuthModal} />
        </section>
        <hr className="separator" />
        
        <section className="section-feedback-list" id="feedbackList">
          <FeedbackList 
            userRole={userRole} 
            token={token} 
            currentUserName={userName} 
          />
        </section>
      </>
    );
  };

  return (
    <div className="container">
      
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
        handleAdminNavigation={handleAdminNavigation}
      />
      
      <div className="content">
        <Modal isOpen={activeModalContent === 1} onClose={closeModal}>
          <ModalApresentacao onClose={closeModal} />
        </Modal>
        
        <Modal isOpen={activeModalContent === "auth"} onClose={closeModal}>
          <AuthModal handleLoginSuccess={handleLogin} onClose={closeModal} />
        </Modal>

        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        
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