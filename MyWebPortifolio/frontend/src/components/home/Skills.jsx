import React from "react";
import "../../styles/skills.css";

const Skills = () => {
  const frontendImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuHnJDLOcdm_0b6N6kNj-1OvO9KhKYgqIy0w&s", // React
    "https://pbs.twimg.com/profile_images/1785867863191932928/EpOqfO6d_400x400.png", // Vue
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/1200px-HTML5_logo_and_wordmark.svg.png", // HTML
    "https://cdn.pixabay.com/photo/2016/11/19/23/00/css3-1841590_1280.png", // CSS
  ];

  const backendImages = [
    "https://cdn-icons-png.flaticon.com/512/226/226777.png", // Java
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9WYHLYIVN011VGVl1pkwPRrAGWPBbG25YrQ&s", // Spring
    "https://images.sftcdn.net/images/t_app-icon-m/p/917c77e8-96d1-11e6-8453-00163ed833e7/3780880766/mysql-com-icon.png", // MySQL
    "https://media.licdn.com/dms/image/v2/D4E12AQF64SYsV08fkA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1662093619580?e=2147483647&v=beta&t=uoidKIOEIH0ZlboxixU1Lfkg5rPnYoCizMrA7P-YVQ4", // Outro
  ];

  return (
    <div className="skills-wrapper">
      <div className="skills-container">
        
        {/* COLUNA 1: As Esteiras Animadas */}
        <div className="skills-section">
          <div className="skill-track-box">
            <h3>🖥️ Frontend:</h3>
            <div className="skills-marquee">
              <div className="skills-marquee-content">
                {frontendImages.map((src, index) => <img key={index} src={src} alt={`Frontend skill ${index}`} className="tech-badge" />)}
                {/* Duplicação para o efeito infinito */}
                {frontendImages.map((src, index) => <img key={`dup-${index}`} src={src} alt={`Frontend skill dup ${index}`} className="tech-badge" />)}
              </div>
            </div>
          </div>

          <div className="skill-track-box">
            <h3>⚙️ Backend & Banco de Dados:</h3>
            <div className="skills-marquee">
              <div className="skills-marquee-content reverse">
                {backendImages.map((src, index) => <img key={index} src={src} alt={`Backend skill ${index}`} className="tech-badge" />)}
                {/* Duplicação para o efeito infinito */}
                {backendImages.map((src, index) => <img key={`dup-${index}`} src={src} alt={`Backend skill dup ${index}`} className="tech-badge" />)}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2: O Divisor Neon (Some no celular) */}
        <div className="skills-divider"></div>

        {/* COLUNA 3: O Texto em Glassmorphism */}
        <div className="skills-text">
          <p>
            No desenvolvimento <strong>Frontend</strong>, utilizo tecnologias modernas para criar
            interfaces interativas e responsivas. Trabalho fortemente com <span className="highlight">React.js e Vue.js</span>,
            além de dominar a base sólida do HTML5 e CSS3 para estruturar e estilizar as páginas.
          </p>
          <p>
            Para tornar o design dinâmico e responsivo, incorporo bibliotecas como Tailwind CSS e
            Bootstrap. Já no <strong>Backend</strong>, minha especialidade é construir APIs robustas utilizando <span className="highlight">Spring Boot com Java 21</span>, garantindo
            escalabilidade e segurança de nível corporativo.
          </p>
          <p>
            Para o armazenamento e gestão de dados relacionais, trabalho com
            <strong> MySQL, PostgreSQL e JPA/Hibernate</strong>. Minha stack me permite assumir aplicações de ponta a ponta, otimizando desde a query no banco até a renderização na tela do usuário. 🚀✨
          </p>
        </div>

      </div>
    </div>
  );
};

export default Skills;