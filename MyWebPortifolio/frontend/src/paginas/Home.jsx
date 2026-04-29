import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/home/Sidebar"; 
import About from "../components/home/About";
import Skills from "../components/home/Skills";
import Projects from "../components/home/Projects";
import Contact from "../components/home/Contact";
import Feedback from "../components/home/Feedback";
import FeedbackList from "../components/home/FeedbackList";
import ArticleCarousel from "../components/home/ArticleCarousel";
import WelcomeAvatar from "../components/home/WelcomeAvatar";
import "../styles/global.css";
import "../styles/home.css";

const Home = () => {
  const { isAuthenticated, token, userName, userRole } = useAuth();
  const context = useOutletContext();
  const openAuthModal = context?.openAuthModal || (() => alert("Modal não conectado!"));

  return (
    <div className="content">
      {/* Sidebar fixa na esquerda (some no mobile via CSS) */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      <main className="main-content">
        <div className="main-container">
          <WelcomeAvatar />

          {/* Hero strip exclusiva do mobile — sidebar some, isso apresenta o dev */}
          <div className="mobile-hero-strip">
            <div className="mhs-identity">
              <img src="/imgperfil.png" alt="Bruno Fraga" className="mhs-avatar" />
              <div>
                <h1 className="mhs-name">Bruno Fraga</h1>
                <p className="mhs-title">&lt;Backend Developer /&gt;</p>
              </div>
            </div>
            <a href="/curriculo_Bruno_Fraga.pdf" download className="mhs-cta">
              ↓ Currículo PDF
            </a>
          </div>
           {/* 4. DESEJO — liderança técnica via artigos */}
          <section className="section-articles" id="articles">
            <ArticleCarousel />
          </section>
          <hr className="separator" />

          {/* 1. ATENÇÃO — projetos: hook visual imediato */}
          <section className="section-projects" id="projects">
            <Projects token={token} userName={userName} userRole={userRole} />
          </section>
          <hr className="separator" />

          {/* 2. INTERESSE — quem é você */}
          <section className="section-about" id="about"><About /></section>
          <hr className="separator" />

          {/* 3. INTERESSE — o que você domina */}
          <section className="section-skills" id="skills"><Skills /></section>
          <hr className="separator" />

         

          {/* 5. DESEJO — prova social */}
          <section className="section-feedback-list" id="feedbackList">
            <FeedbackList userRole={userRole} token={token} currentUserName={userName} />
          </section>
          <hr className="separator" />

          {/* 6. AÇÃO — contato e CTA */}
          <section className="section-contact" id="contact"><Contact /></section>
          <hr className="separator" />

          <section className="section-feedback" id="feedback">
            <Feedback isAuthenticated={isAuthenticated} token={token} openAuthModal={openAuthModal} />
          </section>

        </div>
      </main>
    </div>
  );
};

export default Home;