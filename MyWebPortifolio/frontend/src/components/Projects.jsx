import React, { useState } from "react";
import "../styles/projects.css";
import Modal from "./Modal"; // Assumindo que o Modal está em um arquivo separado, ajuste o caminho se necessário

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    {
      id: 1,
      image: "https://wallpapers.com/images/high/tech-pictures-1920-x-1080-nqr4qrsm66z8irh0.webp",
      title: "Projeto 1",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Descrição breve do Projeto 1. Aqui pode adicionar mais detalhes sobre o projeto.",
      links: [
        { text: "Link para GitHub", url: "https://github.com" },
        { text: "Link para Demo", url: "https://example.com" },
      ],
    },
    {
      id: 2,
      image: "https://wallpapers.com/images/high/tech-pictures-3840-x-2160-n3w27njzo05gggcn.webp",
      title: "Projeto 2",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Descrição breve do Projeto 2. Aqui pode adicionar mais detalhes sobre o projeto.",
      links: [
        { text: "Link para GitHub", url: "https://github.com" },
        { text: "Link para Demo", url: "https://example.com" },
      ],
    },
    {
      id: 3,
      image: "https://wallpapers.com/images/high/tech-pictures-1920-x-1080-gk6brlvu4a49h6wz.webp",
      title: "Projeto 3",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Descrição breve do Projeto 3. Aqui pode adicionar mais detalhes sobre o projeto.",
      links: [
        { text: "Link para GitHub", url: "https://github.com" },
        { text: "Link para Demo", url: "https://example.com" },
      ],
    },
    {
      id: 4,
      image: "https://wallpapers.com/images/high/tech-pictures-2560-x-1600-11f6g33uka5eyom3.webp",
      title: "Projeto 4",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Descrição breve do Projeto 4. Aqui pode adicionar mais detalhes sobre o projeto.",
      links: [
        { text: "Link para GitHub", url: "https://github.com" },
        { text: "Link para Demo", url: "https://example.com" },
      ],
    },
  ];

  return (
    <section className="projects">
      <h2>Projetos</h2>
      <svg width="0" height="0">
        <filter id="static-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.9;0.8;0.9;0.85;0.95"
              dur="0.3s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="10"
          >
            <animate
              attributeName="scale"
              values="10;15;10;12;8"
              dur="0.3s"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.5 0"
          />
        </filter>
      </svg>
      <div className="projects-grid">
        {projects.map((project) => (
          <div
            key={project.id}
            className="project-item"
            onClick={() => {
              setSelectedProject(project);
              setIsModalOpen(true);
            }}
          >
            <img src={project.image} alt={project.title} />
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedProject && (
          <div className="modal-content">
            <h3 className="modal-title">{selectedProject.title}</h3>
            <iframe
              width="100%"
              height="315"
              src={selectedProject.video}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <div className="modal-description">
              <p>{selectedProject.description}</p>
              <ul className="modal-links">
                {selectedProject.links.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Projects;