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
import "../styles/global.css";
import "../styles/home.css";

const Home = () => {
  const { isAuthenticated, token, userName, userRole } = useAuth();
  const context = useOutletContext();
  const openAuthModal = context?.openAuthModal || (() => alert("Modal não conectado!"));

  return (
    <div className="content">

      {/* 1. Sidebar no cantinho dela */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* 2. Conteúdo Principal lado a lado com a Sidebar */}
      <main className="main-content">
        <div className="main-container">

          <section className="section-articles" id="articles">
            <ArticleCarousel />
          </section>
          <hr className="separator" />
          <section className="section-about" id="about"><About /></section>
          <hr className="separator" />

          <section className="section-skills" id="skills"><Skills /></section>
          <hr className="separator" />

          <section className="section-projects" id="projects">
            <Projects token={token} userName={userName} userRole={userRole} />
          </section>
          <hr className="separator" />

          <section className="section-contact" id="contact"><Contact /></section>
          <hr className="separator" />

          <section className="section-feedback-list" id="feedbackList">
            <FeedbackList userRole={userRole} token={token} currentUserName={userName} />
          </section>
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