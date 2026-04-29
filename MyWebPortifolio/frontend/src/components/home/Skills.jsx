import React from "react";
import "../../styles/skills.css";

const coreStack = [
  { src: "https://cdn-icons-png.flaticon.com/512/226/226777.png", name: "Java 21" },
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9WYHLYIVN011VGVl1pkwPRrAGWPBbG25YrQ&s", name: "Spring Boot" },
  { src: "https://media.licdn.com/dms/image/v2/D4E12AQF64SYsV08fkA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1662093619580?e=2147483647&v=beta&t=uoidKIOEIH0ZlboxixU1Lfkg5rPnYoCizMrA7P-YVQ4", name: "PostgreSQL" },
  { src: "https://images.sftcdn.net/images/t_app-icon-m/p/917c77e8-96d1-11e6-8453-00163ed833e7/3780880766/mysql-com-icon.png", name: "MySQL" },
  { src: "https://cdn-icons-png.flaticon.com/512/919/919853.png", name: "Docker" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1200px-Amazon_Web_Services_Logo.svg.png", name: "AWS" },
];

const complementStack = [
  { src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuHnJDLOcdm_0b6N6kNj-1OvO9KhKYgqIy0w&s", name: "React" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/1200px-HTML5_logo_and_wordmark.svg.png", name: "HTML5" },
  { src: "https://cdn.pixabay.com/photo/2016/11/19/23/00/css3-1841590_1280.png", name: "CSS3" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png", name: "TypeScript" },
  { src: "https://git-scm.com/images/logos/downloads/Git-Icon-Color.png", name: "Git" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Git_icon.svg/2048px-Git_icon.svg.png", name: "GitHub" },
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