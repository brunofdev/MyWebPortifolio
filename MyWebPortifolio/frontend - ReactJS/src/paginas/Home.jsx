import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import About from "../components/About";
import Experience from "../components/Experience";
import Skills from "../components/Skills";
import Projects from "../components/Projects";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import "../styles/global.css";
import "../styles/home.css";
import Modal from "../components/Modal";
import ModalApresentacao from "../components/ModalApresentacao";
import Feedback from "../components/Feedback";
import MatrixBackground from "../components/MatrixBackground";


const Home = () => {
  const [activeModalContent, setActiveModalContent] = useState(null);

  useEffect(() => {
    setActiveModalContent(1);
  }, []);

  const openModal = (index) => {
    setActiveModalContent(index);
  };

  const closeModal = () => {
    setActiveModalContent(null);
  };

  return (
    <div className="container">
      <MatrixBackground />
      <Header />
      <div className="content">
        {/* Modal 1 */}
        <Modal isOpen={activeModalContent === 1} onClose={closeModal}>
            <ModalApresentacao onClose={closeModal} />	
        </Modal>
        {/* Modal 2*/}
        <Modal isOpen={activeModalContent === 2} onClose={closeModal}>
          <About />
        </Modal>
         {/* Modal 3*/}
        <Modal isOpen={activeModalContent === 3} onClose={closeModal}>
          <Experience />
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
              <Feedback />
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Home;