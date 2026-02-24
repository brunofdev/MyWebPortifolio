import React from "react";
import "../styles/about.css";

const About = () => {
  return (
    <section className="about-section">
      <div className="about-header">
        <span className="code-comment">// System.out.println("Hello, World!");</span>
        <h2>Quem é Bruno Fraga?</h2>
      </div>

      <div className="about-content">
        <p className="lead-text">
          Desenvolvedor Backend focado em criar a fundação invisível que sustenta grandes aplicações.
        </p>

        <p>
          Desenvolver software é exatamente como construir um arranha-céu: os usuários interagem e se encantam com a fachada de vidro (Frontend), mas é a infraestrutura de aço e concreto (Backend) que garante que tudo fique de pé sob pressão. Minha missão é projetar, construir e blindar essa estrutura.
        </p>

        <p>
          Especialista no ecossistema <strong>Java e Spring Boot</strong>, minha paixão é resolver regras de negócios complexas através de APIs robustas, arquiteturas escaláveis e código limpo (Clean Code). Embora o motor principal das minhas aplicações rode no servidor, também construo interfaces dinâmicas com <strong>React</strong> para entregar a experiência completa de ponta a ponta.
        </p>

        {/* Os 4 Pilares - Scaneabilidade para Recrutadores */}
        <div className="about-pillars">
          <div className="pillar">
            <span className="pillar-icon">🏛️</span>
            <h4>Arquitetura Limpa</h4>
            <p>Sistemas estruturados para crescerem sem quebrar, aplicando princípios SOLID e Clean Architecture.</p>
          </div>
          
          <div className="pillar">
            <span className="pillar-icon">⚡</span>
            <h4>Alta Performance</h4>
            <p>APIs otimizadas, consultas SQL eficientes e modelagem inteligente de banco de dados.</p>
          </div>
          
          <div className="pillar">
            <span className="pillar-icon">🛡️</span>
            <h4>Segurança e Automação</h4>
            <p>Proteção de dados, autenticação blindada e ambientes conteinerizados com Docker.</p>
          </div>

          {/* O NOVO PILAR: AZURE CLOUD */}
          <div className="pillar">
            <span className="pillar-icon">☁️</span>
            <h4>Microsoft Azure</h4>
            <p>Evoluindo na arquitetura de nuvem para implantação, escalabilidade e gestão de serviços cloud-native.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;