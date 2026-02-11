import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import About from "../components/About";
import Experience from "../components/Experience";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import Modal from "../components/Modal";
import ModalApresentacao from "../components/ModalApresentacao";
import Feedback from "../components/Feedback";
import FeedbackList from "../components/FeedbackList";
import MatrixBackground from "../components/MatrixBackground";
import "../styles/global.css";
import "../styles/home.css";

const Home = () => {
  const [activeModalContent, setActiveModalContent] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setActiveModalContent(1); // Abre modal de apresentação ao carregar
  }, []);

  const openModal = (index) => {
    setActiveModalContent(index);
  };

  const closeModal = () => {
    setActiveModalContent(null);
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setToken(data.token);
    setUserRole(data.user.role);
    closeModal();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUserRole(null);
  };

  const openAuthModal = () => {
    setActiveModalContent("auth");
  };

  return (
    <div className="container">
      <MatrixBackground />
      <Header
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
      />
      <div className="content">
        {/* Modal de Apresentação */}
        <Modal isOpen={activeModalContent === 1} onClose={closeModal}>
          <ModalApresentacao onClose={closeModal} />
        </Modal>
        {/* Modal de Sobre */}
        <Modal isOpen={activeModalContent === 2} onClose={closeModal}>
          <About />
        </Modal>
        {/* Modal de Experiência */}
        <Modal isOpen={activeModalContent === 3} onClose={closeModal}>
          <Experience />
        </Modal>
        {/* Modal de Autenticação */}
        <Modal isOpen={activeModalContent === "auth"} onClose={closeModal}>
          <AuthModal handleLoginSuccess={handleLogin} onClose={closeModal} />
        </Modal>
        <Sidebar />
        <main className="main-content">
          <div className="main-container">
            <section className="section-about" id="about">
              <About />
            </section>
            <hr className="separator" />
            <section className="section-experience" id="experience">
              <Experience />
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
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Home;