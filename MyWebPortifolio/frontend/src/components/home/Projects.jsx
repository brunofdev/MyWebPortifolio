// Projects.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import "../../styles/projects.css";
import Modal from "../Modal";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
const DEFAULT_PROJECT_IMAGE = "https://via.placeholder.com/600?text=Sem+Imagem";

const Projects = ({ token, userName, userRole }) => {
  // ==========================================
  // ESTADOS GERAIS
  // ==========================================
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // ESTADOS DO MODAL E GALERIA
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ==========================================
  // ESTADOS DO FEEDBACK
  // ==========================================
  const [descricao, setDescricao] = useState("");
  const [avaliacao, setAvaliacao] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  const activeProject = projects[currentIndex];

  // ==========================================
  // EFEITOS (USE EFFECTS)
  // ==========================================

  // 1. Carrega os projetos públicos ao iniciar
  useEffect(() => {
    const fetchPublicProjects = async () => {
      try {
        const response = await fetch(`${BASE_URL}/projetos/publicos`);
        const data = await response.json();
        if (response.ok) {
          setProjects(data.dados || []);
        } else {
          throw new Error(data.message || "Erro ao carregar os projetos.");
        }
      } catch (err) {
        console.error("Erro na vitrine:", err);
        setError("Não foi possível carregar os projetos no momento.");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicProjects();
  }, []);

  // 2. Reseta o formulário de feedback ao trocar de projeto
  useEffect(() => {
    setDescricao("");
    setAvaliacao(5);
    setFeedbackMsg("");
  }, [currentIndex]);

  // 3. Busca a lista de feedbacks do projeto atual
  useEffect(() => {
    if (isModalOpen && activeProject) {
      fetchFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, activeProject]);

  // ==========================================
  // NAVEGAÇÃO DE PROJETOS E GALERIA
  // ==========================================
  const openModal = (index) => {
    setCurrentIndex(index);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const nextProject = () => {
    if (projects.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
      setCurrentImageIndex(0);
    }
  };

  const prevProject = () => {
    if (projects.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
      setCurrentImageIndex(0);
    }
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (activeProject?.galeria) {
      setCurrentImageIndex((prev) => (prev + 1) % activeProject.galeria.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (activeProject?.galeria) {
      setCurrentImageIndex((prev) => (prev - 1 + activeProject.galeria.length) % activeProject.galeria.length);
    }
  };

  // ==========================================
  // LÓGICA DE API: FEEDBACKS
  // ==========================================
  const fetchFeedbacks = async () => {
    if (!activeProject) return;
    try {
      const response = await fetch(`${BASE_URL}/feedback/projetos/listar-todos/${activeProject.id}`);
      const data = await response.json();
      if (response.ok) {
        setFeedbacks(data.dados || []);
      } else {
        console.error("Erro ao carregar feedbacks:", data.message);
      }
    } catch (err) {
      console.error("Erro na conexão ao buscar feedbacks:", err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    setIsSubmittingFeedback(true);
    setFeedbackMsg("");

    try {
      const response = await fetch(`${BASE_URL}/feedback/projetos/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: descricao,
          avaliacao: avaliacao,
          tipoFeedback: "PROJETO",
          referenciaId: activeProject.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbackMsg("✅ Feedback enviado com sucesso!");
        setDescricao("");
        setAvaliacao(5);
        fetchFeedbacks();
      } else {
        const mensagemErro = data.erro?.message || data.message || "Não foi possível enviar o feedback.";
        setFeedbackMsg("❌ " + mensagemErro);
      }
    } catch (err) {
      setFeedbackMsg("❌ Erro de conexão com o servidor ao enviar feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este feedback?')) return;

    try {
      const response = await fetch(`${BASE_URL}/feedback/projetos/excluir/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchFeedbacks();
      } else {
        const data = await response.json();
        alert("❌ Erro: " + (data.message || "Não foi possível excluir o feedback."));
      }
    } catch (err) {
      alert("❌ Erro de conexão com o servidor ao excluir feedback.");
    }
  };

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  if (loading) return <div className="projects-loading">Iniciando sistemas...</div>;
  if (error) return <div className="projects-error">⚠️ {error}</div>;

  return (
    <section className="projects">
      <h2>Projetos em Destaque</h2>

      {/* Filtro SVG para efeito visual de ruído */}
      <svg width="0" height="0">
        <filter id="static-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0" />
          <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
          <feBlend mode="multiply" in="monoNoise" in2="SourceGraphic" result="blend" />
        </filter>
      </svg>

      {/* GRID DE PROJETOS NA TELA PRINCIPAL */}
      <div className="projects-grid">
        {projects.map((project, index) => {
          const capaObj = project.galeria?.find(img => img.isCapa) || project.galeria?.[0];
          const capaUrl = capaObj ? capaObj.urlImagem : DEFAULT_PROJECT_IMAGE;

          return (
            <div key={project.id} className="project-item" onClick={() => openModal(index)}>
              <img src={capaUrl} alt={project.title} />
              <div className="project-title-overlay">{project.title}</div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE DETALHES DO PROJETO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {activeProject && (
          <>
            <button className="nav-arrow left-arrow" onClick={prevProject} disabled={projects.length <= 1}>&#8592;</button>
            <button className="nav-arrow right-arrow" onClick={nextProject} disabled={projects.length <= 1}>&#8594;</button>

            <div className="modal-content">
              <h3 className="modal-title">{activeProject.title}</h3>

              {/* GALERIA CARROSSEL */}
              {activeProject.galeria && activeProject.galeria.length > 0 && (
                <div className="carousel-container" onClick={() => setIsLightboxOpen(true)} title="Clique para ampliar">
                  <img
                    src={activeProject.galeria[currentImageIndex].urlImagem}
                    alt={`Galeria ${currentImageIndex + 1}`}
                    className="carousel-main-image"
                  />

                  {activeProject.galeria[currentImageIndex].legenda && (
                    <div className="carousel-legend">{activeProject.galeria[currentImageIndex].legenda}</div>
                  )}

                  {activeProject.galeria.length > 1 && (
                    <>
                      <button className="carousel-btn prev" onClick={prevImage}>‹</button>
                      <button className="carousel-btn next" onClick={nextImage}>›</button>
                      <div className="carousel-counter">{currentImageIndex + 1} / {activeProject.galeria.length}</div>
                    </>
                  )}
                  <div className="expand-hint">🔍 Ampliar</div>
                </div>
              )}

              {/* VÍDEO DO PROJETO */}
              {activeProject.video && (
                <iframe
                  width="100%" height="315" src={activeProject.video} title={activeProject.title}
                  frameBorder="0" allowFullScreen
                ></iframe>
              )}

              {/* DESCRIÇÃO E DETALHES TÉCNICOS */}
              <div className="modal-description">

                {/* O TEXTO RENDERIZADO COM MARKDOWN */}
                <div className="markdown-body">
                  <ReactMarkdown>{activeProject.description}</ReactMarkdown>
                </div>

                {activeProject.techs && (
                  <div className="tech-specs">
                    <h4>Ficha Técnica:</h4>
                    <ul>
                      {activeProject.techs.linguagem && <li><strong>Linguagem:</strong> {activeProject.techs.linguagem}</li>}
                      {activeProject.techs.paradigma && <li><strong>Paradigma:</strong> {activeProject.techs.paradigma}</li>}
                      {activeProject.techs.framework && <li><strong>Framework:</strong> {activeProject.techs.framework}</li>}
                      {activeProject.techs.bibliotecas && <li><strong>Bibliotecas:</strong> {activeProject.techs.bibliotecas}</li>}
                      {activeProject.techs.infraestrutura && <li><strong>Infraestrutura:</strong> {activeProject.techs.infraestrutura}</li>}
                    </ul>
                  </div>
                )}

                {activeProject.setup && activeProject.setup.steps && activeProject.setup.steps.length > 0 && (
                  <div className="setup-section">
                    <h4>Como rodar e testar o projeto?</h4>
                    {activeProject.setup.obs && <p className="setup-obs">⚠️ {activeProject.setup.obs}</p>}

                    <div className="terminal-box">
                      {activeProject.setup.steps.map((step) => (
                        <div key={step.num} className="step-item">
                          <p><strong>{step.num} &#10132;</strong> {step.text}</p>
                          {step.cmd && <code>{step.cmd}</code>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ul className="modal-links">
                  {activeProject.links && activeProject.links.map((link, idx) => (
                    <li key={idx}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a></li>
                  ))}
                </ul>
              </div>

              <hr className="modal-divider" />

              {/* FORMULÁRIO DE FEEDBACK DO PROJETO */}
              <div className="project-feedback-section">
                <h4>Avalie este projeto</h4>

                {!token ? (
                  <p className="login-prompt">Faça login no sistema para deixar um feedback.</p>
                ) : (
                  <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                    <div className="star-rating-selector">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${star <= avaliacao ? 'selected' : ''}`}
                          onClick={() => setAvaliacao(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <textarea
                      placeholder="O que você achou da arquitetura e do código deste projeto?"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      required
                      rows="3"
                      className="feedback-textarea"
                    />

                    <button type="submit" className="submit-feedback-btn" disabled={isSubmittingFeedback || !descricao.trim()}>
                      {isSubmittingFeedback ? "Enviando..." : "Enviar Feedback"}
                    </button>

                    {feedbackMsg && <p className="feedback-status-msg">{feedbackMsg}</p>}
                  </form>
                )}
              </div>

              <hr className="modal-divider" />

              {/* LISTA DE FEEDBACKS ENVIADOS */}
              <div className="project-feedbacks-list">
                <h4>Feedbacks sobre este projeto</h4>
                {feedbacks.length > 0 ? (
                  <ul>
                    {feedbacks.map((fb) => {
                      const nomeExibicao = fb.isAnonimo ? "Anônimo" : (fb.criadoPor || 'Usuário');
                      const fotoExibicao = fb.isAnonimo ? DEFAULT_AVATAR : (fb.fotoUsuario || DEFAULT_AVATAR);
                      const podeDeletar = (fb.userName === userName || userRole === 'ADMIN3');

                      return (
                        <li key={fb.id}>
                      
                          <div className="feedback-item">
                            <img src={fotoExibicao} alt={`Foto de ${nomeExibicao}`} className="feedback-user-photo" />
                            <div className="feedback-content2">
                              <div className="project-feedbacklist-header">
                                <strong className="feedback-user-name">{nomeExibicao} disse:</strong>
                                 <span className="feedback-date">{new Date(fb.dataDeCriacao).toLocaleString('pt-BR')}</span>

                              </div>
                              <p className="feedback-comment2">{fb.comentario}</p>
                                 {podeDeletar && (
                              <button className="delete-feedback-btn" onClick={() => handleDeleteFeedback(fb.id)}>Apagar meu feedback</button>
                            )}

                            </div>

                          </div>

                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="no-feedbacks">Ainda não há feedbacks para este projeto.</p>
                )}
              </div>

            </div>
          </>
        )}
      </Modal>

      {/* LIGHTBOX (IMAGEM EM TELA CHEIA) */}
      {isLightboxOpen && activeProject?.galeria && ReactDOM.createPortal(
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>✖</button>

          {activeProject.galeria.length > 1 && (
            <>
              <button className="lightbox-nav left" onClick={prevImage}>&#10094;</button>
              <button className="lightbox-nav right" onClick={nextImage}>&#10095;</button>
            </>
          )}

          <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <img src={activeProject.galeria[currentImageIndex].urlImagem} alt="Tela cheia" className="lightbox-image" />

            {activeProject.galeria[currentImageIndex].legenda && (
              <div className="lightbox-legend">{activeProject.galeria[currentImageIndex].legenda}</div>
            )}

            {activeProject.galeria.length > 1 && (
              <div className="lightbox-counter">
                {currentImageIndex + 1} / {activeProject.galeria.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default Projects;