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
  const [rocketLaunched, setRocketLaunched] = useState(false);

  useEffect(() => {
    setActiveModalContent(1);
  }, []);

  const openModal = (index) => {
    setActiveModalContent(index);
  };

  const closeModal = () => {
    setActiveModalContent(null);
  };

  const handleRocketLaunch = () => {
    setRocketLaunched(true);
  };

  return (
    <div className="container">
      <MatrixBackground />
      <Header rocketLaunched={rocketLaunched} />
      <div className="content">
        {/* Modal 1 */}
        <Modal isOpen={activeModalContent === 1} onClose={closeModal}>
          <ModalApresentacao onClose={closeModal} onRocketLaunch={handleRocketLaunch} />
        </Modal>
        {/* Modal 2 */}
        <Modal isOpen={activeModalContent === 2} onClose={closeModal}>
          <About rocketLaunched={rocketLaunched} />
        </Modal>
        {/* Modal 3 */}
        <Modal isOpen={activeModalContent === 3} onClose={closeModal}>
          <Experience rocketLaunched={rocketLaunched} />
        </Modal>
        <Sidebar rocketLaunched={rocketLaunched} />
        <main className="main-content">
          <section className="section-about" id="about" onClick={() => openModal(2)}>
            Quem é Bruno de Fraga?
          </section>
          <section className="section-experience" id="experience" onClick={() => openModal(3)}>
            Experiências
          </section>
          <section id="skills">
            <Skills rocketLaunched={rocketLaunched} />
          </section>
          <section id="projects">
            <Projects rocketLaunched={rocketLaunched} />
          </section>
          <section id="contact">
            <Contact rocketLaunched={rocketLaunched} />
          </section>
          <section id="feedback">
            <Feedback rocketLaunched={rocketLaunched} />
          </section>
        </main>
      </div>
      <Footer rocketLaunched={rocketLaunched} />
    </div>
  );
};

export default Home;