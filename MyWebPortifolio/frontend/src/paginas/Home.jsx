import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import About from "../components/About";
import Experience from "../components/Experience";
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
  
  // NOVO: Gerenciador de Telas Universal
  const [currentView, setCurrentView] = useState("home"); 

  useEffect(() => {
    setActiveModalContent(1); // Abre modal de apresentação ao carregar
  }, []);

  const closeModal = () => setActiveModalContent(null);
  const openAuthModal = () => setActiveModalContent("auth");

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setToken(data.token);
    setUserRole(data.user.role);
    setUserName(data.user.userName);
    closeModal();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserRole(null);
    setUserName(null);
    goHome(); // Garante que volte pro início ao sair
  };

  // ==========================================
  // NOVO: NAVEGAÇÃO ENTRE TELAS E SCROLL
  // ==========================================
  const openEditProfile = () => {
    setCurrentView("editProfile");
    window.scrollTo({ top: 0, behavior: "smooth" }); // Rola pro topo suavemente
  };

  const goHome = () => {
    setCurrentView("home");
    window.scrollTo({ top: 0, behavior: "smooth" }); // Rola pro topo suavemente
  };

  // ==========================================
  // RENDERIZADOR DO PAINEL PRINCIPAL
  // ==========================================
  const renderMainContent = () => {
    switch (currentView) {
      case "editProfile":
        return <EditProfile onClose={goHome} userName={userName} />;
      
      // No futuro, você pode adicionar: 
      // case "configuracoes": return <Config />
      
      case "home":
      default:
        return (
          <>
            <section className="section-about" id="about">
              <About />
            </section>
            <hr className="separator" />
            <section id="skills">
              <Skills />
            </section>
            <hr className="separator" />
            <section id="projects">
              <Projects />
            </section>
            <hr className="separator" />
            <section id="contact">
              <Contact />
            </section>
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
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
        openEditProfile={openEditProfile}
        goHome={goHome} // O Header agora usa a função que sobe a tela!
      />
      
      <div className="content">
        {/* Modais */}
        <Modal isOpen={activeModalContent === 1} onClose={closeModal}>
          <ModalApresentacao onClose={closeModal} />
        </Modal>
        <Modal isOpen={activeModalContent === 2} onClose={closeModal}>
          <About />
        </Modal>
        <Modal isOpen={activeModalContent === 3} onClose={closeModal}>
          <Experience />
        </Modal>
        <Modal isOpen={activeModalContent === "auth"} onClose={closeModal}>
          <AuthModal handleLoginSuccess={handleLogin} onClose={closeModal} />
        </Modal>

        <Sidebar />
        
        <main className="main-content">
          <div className="main-container">
            {/* O gerenciador de telas faz a troca dos componentes aqui */}
            {renderMainContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Home;