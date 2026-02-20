import React, { useState } from "react";
import "../styles/projects.css";
import Modal from "./Modal";

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const projects = [
    {
      id: 1,
      image: "https://wallpapers.com/images/high/tech-pictures-1920-x-1080-nqr4qrsm66z8irh0.webp",
      title: "API Restaurante",
      video: "https://www.youtube.com/embed/w3QDj-_1O3o",
      description: "API robusta focada em segurança, validação de dados e retornos padronizados para facilitar a integração com o front-end.",
      techs: {
        linguagem: "Java 21",
        paradigma: "Orientação a Objetos (POO)",
        framework: "Spring Boot 3.4",
        bibliotecas: "Spring Security, Hibernate/JPA, HikariCP, SpringDoc/swagger",
        infraestrutura: "Docker containerizando a aplicação completa para rodar localmente. ",
      },
      setup: {
        obs: "Pré-requisito: Docker/Git instalados e Docker rodando na sua máquina.",
        steps: [
          { num: 1, text: "Abra o seu Terminal ou CMD e baixe o repositório:", cmd: "git clone https://github.com/brunofdev/sistema-restaurante-api.git" },
          { num: 2, text: "Entre na pasta do projeto recém-baixado:", cmd: "cd sistema-restaurante-api" },
          { num: 3, text: "Suba o banco de dados e a aplicação automaticamente:", cmd: "docker-compose up -d" }
        ]
      },
      links: [
        { text: "Repositório GitHub", url: "https://github.com/brunofdev/sistema-restaurante-api" },
      ],
    },
    // Demais projetos...
  ];

  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const nextProject = () => setCurrentIndex((prev) => (prev + 1) % projects.length);
  const prevProject = () => setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);

  const activeProject = projects[currentIndex];

  return (
    <section className="projects">
      <h2>Projetos</h2>
      <svg width="0" height="0">
         {/* Seu filtro SVG continua aqui */}
      </svg>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <div key={project.id} className="project-item" onClick={() => openModal(index)}>
            <img src={project.image} alt={project.title} />
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {activeProject && (
          <>
            {/* Setas movidas para fora do conteúdo principal para flutuarem */}
            <button className="nav-arrow left-arrow" onClick={prevProject}>&#8592;</button>
            <button className="nav-arrow right-arrow" onClick={nextProject}>&#8594;</button>

            <div className="modal-content">
              <h3 className="modal-title">{activeProject.title}</h3>

              <iframe
                width="100%" height="315" src={activeProject.video} title={activeProject.title}
                frameBorder="0" allowFullScreen
              ></iframe>

              <div className="modal-description">
                <p className="main-desc">{activeProject.description}</p>
                
                <div className="tech-specs">
                  <h4>Ficha Técnica:</h4>
                  <ul>
                    <li><strong>Linguagem:</strong> {activeProject.techs.linguagem}</li>
                    <li><strong>Paradigma:</strong> {activeProject.techs.paradigma}</li>
                    <li><strong>Framework:</strong> {activeProject.techs.framework}</li>
                    <li><strong>Bibliotecas:</strong> {activeProject.techs.bibliotecas}</li>
                    <li><strong>Infraestrutura:</strong> {activeProject.techs.infraestrutura}</li>
                  </ul>
                </div>

                {/* Nova Sessão: Como Rodar */}
                {activeProject.setup && (
                  <div className="setup-section">
                    <h4>Como rodar e testar o projeto?</h4>
                    <p className="setup-obs">⚠️ {activeProject.setup.obs}</p>
                    <div className="terminal-box">
                      {activeProject.setup.steps.map((step) => (
                        <div key={step.num} className="step-item">
                          <p><strong>{step.num} &#10132;</strong> {step.text}</p>
                          <code>{step.cmd}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ul className="modal-links">
                  {activeProject.links.map((link, idx) => (
                    <li key={idx}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
};

export default Projects;