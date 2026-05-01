import React from "react";
import "../../styles/skills.css";

const coreStack = [
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", name: "Java 21" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg", name: "Spring Boot" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg", name: "PostgreSQL" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg", name: "MySQL" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg", name: "Docker" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", name: "AWS" },
];

const complementStack = [
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", name: "React" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", name: "HTML5" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg", name: "CSS3" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg", name: "TypeScript" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg", name: "Git" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg", name: "GitHub" },
];

const expertise = [
  { label: "REST APIs", detail: "Design, versionamento e documentação com OpenAPI/Swagger." },
  { label: "Clean Architecture", detail: "DDD, SOLID e separação de responsabilidades em larga escala." },
  { label: "JPA / Hibernate", detail: "Modelagem relacional, N+1 mitigation e query optimization." },
  { label: "Spring Security", detail: "JWT, OAuth2, RBAC e autenticação stateless em APIs corporativas." },
  { label: "Docker & CI/CD", detail: "Containerização, pipelines automatizados e deploy contínuo." },
  { label: "Cloud — Azure & AWS", detail: "Serviços gerenciados, escalabilidade e arquitetura cloud-native." },
];

const Skills = () => {
  return (
    <div className="skills-wrapper">

      {/* TOPO: identidade da seção */}
      <div className="skills-header">
        <span className="skills-eyebrow">// stack técnica</span>
        <h2 className="skills-title">
          <span className="skills-title-accent">Java + Spring Boot</span>
        </h2>
        <p className="skills-subtitle">
          Backend como especialidade, Full-Stack como entrega. Cada camada da aplicação construída com intenção.
        </p>
      </div>

      {/* ESTEIRAS — desktop */}
      <div className="skills-tracks">
        <div className="skills-track-label">
          <span className="track-label-dot track-label-dot--primary" />
          Core Stack
        </div>
        <div className="skills-marquee">
          <div className="skills-marquee-content">
            {[...coreStack, ...coreStack].map((s, i) => (
              <div className="tech-badge" key={i} title={s.name}>
                <img src={s.src} alt={s.name} className="tech-badge-img" />
                <span className="tech-badge-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="skills-track-label">
          <span className="track-label-dot track-label-dot--secondary" />
          Complementar
        </div>
        <div className="skills-marquee">
          <div className="skills-marquee-content reverse">
            {[...complementStack, ...complementStack].map((s, i) => (
              <div className="tech-badge" key={i} title={s.name}>
                <img src={s.src} alt={s.name} className="tech-badge-img" />
                <span className="tech-badge-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRID DE EXPERTISE */}
      <div className="skills-expertise-block">
        <span className="skills-eyebrow skills-eyebrow--spaced">// domínios de expertise</span>
        <div className="skills-expertise-grid">
          {expertise.map((item, i) => (
            <div className="expertise-card" key={i}>
              <div className="expertise-card-top">
                <span className="expertise-index">0{i + 1}</span>
                <h4 className="expertise-label">{item.label}</h4>
              </div>
              <p className="expertise-detail">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE: grid estático */}
      <div className="skills-mobile-grid">
        <div className="smg-group">
          <span className="smg-title">Core Stack</span>
          <div className="smg-row">
            {coreStack.map((s, i) => (
              <div key={i} className="smg-item">
                <img src={s.src} alt={s.name} className="smg-icon" />
                <span className="smg-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="smg-group">
          <span className="smg-title">Complementar</span>
          <div className="smg-row">
            {complementStack.map((s, i) => (
              <div key={i} className="smg-item">
                <img src={s.src} alt={s.name} className="smg-icon" />
                <span className="smg-name">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Skills;