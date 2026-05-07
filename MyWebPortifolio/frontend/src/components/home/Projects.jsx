// Projects.jsx
// ============================================================
// Autor: Portfólio Java Developer
// Descrição: Vitrine de projetos com sistema de feedback,
//            galeria com lightbox e navegação modal.
// ============================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  memo,
} from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Modal from "../Modal";
import "../../styles/projects.css";

// ============================================================
// CONSTANTES E CONFIGURAÇÃO
// ============================================================
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const ASSETS = {
  DEFAULT_AVATAR:
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  DEFAULT_PROJECT_IMAGE: "https://via.placeholder.com/600?text=Sem+Imagem",
};

const API_ROUTES = {
  publicProjects: () => `${BASE_URL}/projetos/publicos`,
  listFeedbacks: (projectId) =>
    `${BASE_URL}/feedback/projetos/listar-todos/${projectId}`,
  createFeedback: () => `${BASE_URL}/feedback/projetos/criar`,
  deleteFeedback: (id) => `${BASE_URL}/feedback/projetos/excluir/${id}`,
};

// ============================================================
// CUSTOM HOOKS
// ============================================================
function useProjects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setStatus("loading");
      try {
        const res = await fetch(API_ROUTES.publicProjects());
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? "Erro desconhecido.");
        if (!cancelled) {
          setProjects(json.dados ?? []);
          setStatus("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return { projects, status, error };
}

function useFeedbacks(projectId, token) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMsg, setSubmitMsg] = useState("");

  const fetchFeedbacks = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await fetch(API_ROUTES.listFeedbacks(projectId));
      const json = await res.json();
      if (res.ok) setFeedbacks(json.dados ?? []);
    } catch {}
  }, [projectId]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const submitFeedback = useCallback(
    async ({ descricao, avaliacao }) => {
      if (!descricao.trim()) return;
      setSubmitStatus("loading");
      setSubmitMsg("");
      try {
        const res = await fetch(API_ROUTES.createFeedback(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            descricao, avaliacao,
            tipoFeedback: "PROJETO",
            referenciaId: projectId,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.erro?.message ?? json.message ?? "Falha no envio.");
        setSubmitStatus("success");
        setSubmitMsg("✅ Feedback enviado com sucesso!");
        fetchFeedbacks();
      } catch (err) {
        setSubmitStatus("error");
        setSubmitMsg(`❌ ${err.message}`);
      }
    },
    [projectId, token, fetchFeedbacks]
  );

  const deleteFeedback = useCallback(
    async (id) => {
      if (!window.confirm("Tem certeza que deseja excluir este feedback?")) return;
      try {
        const res = await fetch(API_ROUTES.deleteFeedback(id), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) fetchFeedbacks();
        else {
          const json = await res.json();
          alert(`❌ ${json.message ?? "Não foi possível excluir."}`);
        }
      } catch { alert("❌ Erro de conexão ao excluir feedback."); }
    },
    [token, fetchFeedbacks]
  );

  return { feedbacks, submitStatus, submitMsg, submitFeedback, deleteFeedback };
}

function useGallery(projectId) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => { setCurrentImageIndex(0); }, [projectId]);
  const navigate = useCallback((direction, totalImages) => {
    setCurrentImageIndex((prev) => {
      if (direction === "next") return (prev + 1) % totalImages;
      return (prev - 1 + totalImages) % totalImages;
    });
  }, []);
  return { currentImageIndex, navigate };
}

// ============================================================
// CARD MODERNO — Terminal aesthetic
// ============================================================
const ProjectCard = memo(({ project, onClick, index }) => {
  const coverImage = useMemo(() => {
    const coverObj =
      project.galeria?.find((img) => img.isCapa) ?? project.galeria?.[0];
    return coverObj?.urlImagem ?? ASSETS.DEFAULT_PROJECT_IMAGE;
  }, [project.galeria]);

  // Stack tags do TechnicalSheetDTO
  const stackTags = useMemo(() => {
    const tags = [];
    if (project.techs?.linguagem) tags.push(project.techs.linguagem.split(",")[0].trim());
    if (project.techs?.framework) tags.push(project.techs.framework.split(",")[0].trim());
    if (project.techs?.infraestrutura) {
      const infra = project.techs.infraestrutura.split(",")[0].trim();
      if (infra) tags.push(infra);
    }
    return tags.slice(0, 3);
  }, [project.techs]);

  // Descrição curta (primeira linha do markdown, sem formatação)
  const shortDescription = useMemo(() => {
    if (!project.description) return "";
    const cleaned = project.description
      .replace(/[#*`_~>]/g, "")
      .replace(/\n+/g, " ")
      .trim();
    return cleaned.length > 130 ? cleaned.slice(0, 130) + "…" : cleaned;
  }, [project.description]);

  const isLive = !!project.liveUrl;
  const projectNumber = String(index + 1).padStart(2, "0");

  return (
    <article
      className="pcard"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes do projeto: ${project.title}`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{ "--card-delay": `${index * 0.08}s` }}
    >
      {/* Header estilo terminal macOS */}
      <header className="pcard__header">
        <div className="pcard__dots" aria-hidden="true">
          <span className="pcard__dot pcard__dot--red" />
          <span className="pcard__dot pcard__dot--yellow" />
          <span className="pcard__dot pcard__dot--green" />
        </div>
        <span className="pcard__path">~/projects/{projectNumber}</span>
        {isLive && (
          <span className="pcard__live" aria-label="Em produção">
            <span className="pcard__live-dot" />
            LIVE
          </span>
        )}
      </header>

      {/* Imagem com overlay sutil */}
      <div className="pcard__media">
        <img src={coverImage} alt={project.title} loading="lazy" />
        <div className="pcard__media-shade" aria-hidden="true" />
        <span className="pcard__number" aria-hidden="true">{projectNumber}</span>
      </div>

      {/* Corpo do card */}
      <div className="pcard__body">
        <h3 className="pcard__title">{project.title}</h3>
        {shortDescription && (
          <p className="pcard__desc">{shortDescription}</p>
        )}

        {/* Metadata */}
        {(project.papel || project.status) && (
          <div className="pcard__meta">
            {project.status && (
              <span className="pcard__meta-item">
                <span className="pcard__meta-label">status</span>
                <span className="pcard__meta-value">{project.status}</span>
              </span>
            )}
            {project.papel && (
              <span className="pcard__meta-item">
                <span className="pcard__meta-label">role</span>
                <span className="pcard__meta-value">{project.papel}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer com stack + CTA */}
      <footer className="pcard__footer">
        {stackTags.length > 0 && (
          <div className="pcard__stack">
            {stackTags.map(tag => (
              <span key={tag} className="pcard__chip">{tag}</span>
            ))}
          </div>
        )}
        <span className="pcard__cta" aria-hidden="true">
          ver projeto
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </footer>

      {/* Glow no hover */}
      <div className="pcard__glow" aria-hidden="true" />
    </article>
  );
});
ProjectCard.displayName = "ProjectCard";

// ============================================================
// COMPONENTES INTERNOS DO MODAL
// ============================================================

const StarRating = memo(({ value, onChange }) => (
  <div className="star-rating-selector" role="radiogroup" aria-label="Avaliação de 1 a 5 estrelas">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= value ? "selected" : ""}`}
        onClick={() => onChange(star)}
        role="radio"
        aria-checked={star === value}
        aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onChange(star)}
      >★</span>
    ))}
  </div>
));
StarRating.displayName = "StarRating";

const FeedbackItem = memo(({ feedback, canDelete, onDelete }) => {
  const displayName = feedback.isAnonimo ? "Anônimo" : feedback.criadoPor ?? "Usuário";
  const avatarSrc = feedback.isAnonimo ? ASSETS.DEFAULT_AVATAR : (feedback.fotoUsuario ?? ASSETS.DEFAULT_AVATAR);
  const formattedDate = useMemo(
    () => new Date(feedback.dataDeCriacao).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
    [feedback.dataDeCriacao]
  );
  const stars = useMemo(() => "★".repeat(feedback.avaliacao ?? 0), [feedback.avaliacao]);

  return (
    <li>
      <div className="feedback-item">
        <img src={avatarSrc} alt={`Avatar de ${displayName}`} className="feedback-user-photo" loading="lazy" />
        <div className="feedback-content2">
          <div className="project-feedbacklist-header">
            <strong className="feedback-user-name">{displayName}</strong>
            {stars && <span className="feedback-rating" aria-label={`${feedback.avaliacao} estrelas`}>{stars}</span>}
            <time className="feedback-date" dateTime={feedback.dataDeCriacao}>{formattedDate}</time>
          </div>
          <p className="feedback-comment2">{feedback.comentario}</p>
          {canDelete && (
            <button className="delete-feedback-btn" onClick={() => onDelete(feedback.id)} aria-label="Excluir meu feedback">
              Apagar meu feedback
            </button>
          )}
        </div>
      </div>
    </li>
  );
});
FeedbackItem.displayName = "FeedbackItem";

const FeedbackForm = memo(({ onSubmit, submitStatus, submitMsg }) => {
  const [descricao, setDescricao] = useState("");
  const [avaliacao, setAvaliacao] = useState(5);
  const isLoading = submitStatus === "loading";
  useEffect(() => { if (submitStatus === "success") setDescricao(""); }, [submitStatus]);
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit({ descricao, avaliacao });
  }, [onSubmit, descricao, avaliacao]);

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      <StarRating value={avaliacao} onChange={setAvaliacao} />
      <textarea
        className="feedback-textarea"
        placeholder="O que você achou da arquitetura e do código deste projeto?"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required rows={3}
        aria-label="Comentário sobre o projeto"
      />
      <button type="submit" className="submit-feedback-btn" disabled={isLoading || !descricao.trim()}>
        {isLoading ? "Enviando..." : "Enviar Feedback"}
      </button>
      {submitMsg && (
        <p className="feedback-status-msg" role="status" aria-live="polite">{submitMsg}</p>
      )}
    </form>
  );
});
FeedbackForm.displayName = "FeedbackForm";

const ImageCarousel = memo(({ images, currentIndex, onNavigate, onExpand }) => {
  if (!images?.length) return null;
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;
  const handlePrev = useCallback((e) => { e.stopPropagation(); onNavigate("prev", images.length); }, [onNavigate, images.length]);
  const handleNext = useCallback((e) => { e.stopPropagation(); onNavigate("next", images.length); }, [onNavigate, images.length]);

  return (
    <div className="carousel-container" onClick={onExpand} title="Clique para ampliar"
      role="button" aria-label="Ampliar imagem" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onExpand()}>
      <img src={currentImage.urlImagem} alt={currentImage.legenda ?? `Imagem ${currentIndex + 1} do projeto`} className="carousel-main-image" />
      {currentImage.legenda && <p className="carousel-legend">{currentImage.legenda}</p>}
      {hasMultiple && (
        <>
          <button className="carousel-btn prev" onClick={handlePrev} aria-label="Imagem anterior">‹</button>
          <button className="carousel-btn next" onClick={handleNext} aria-label="Próxima imagem">›</button>
          <span className="carousel-counter" aria-label={`Imagem ${currentIndex + 1} de ${images.length}`}>
            {currentIndex + 1} / {images.length}
          </span>
        </>
      )}
      <span className="expand-hint" aria-hidden="true">🔍 Ampliar</span>
    </div>
  );
});
ImageCarousel.displayName = "ImageCarousel";

const TechSpecs = memo(({ techs }) => {
  if (!techs) return null;
  const fields = [
    { key: "linguagem", label: "Linguagem" },
    { key: "paradigma", label: "Paradigma" },
    { key: "framework", label: "Framework" },
    { key: "bibliotecas", label: "Bibliotecas" },
    { key: "infraestrutura", label: "Infraestrutura" },
  ];
  const visibleFields = fields.filter(({ key }) => techs[key]);
  if (!visibleFields.length) return null;

  return (
    <div className="tech-specs">
      <h4>Ficha Técnica:</h4>
      <ul>
        {visibleFields.map(({ key, label }) => (
          <li key={key}><strong>{label}:</strong> {techs[key]}</li>
        ))}
      </ul>
    </div>
  );
});
TechSpecs.displayName = "TechSpecs";

const SetupSection = memo(({ setup }) => {
  if (!setup?.steps?.length) return null;
  return (
    <div className="setup-section">
      <h4>Como rodar e testar o projeto?</h4>
      {setup.obs && <p className="setup-obs">⚠️ {setup.obs}</p>}
      <div className="terminal-box">
        {setup.steps.map((step) => (
          <div key={step.num} className="step-item">
            <p><strong>{step.num} ➜</strong> {step.text}</p>
            {step.cmd && <code>{step.cmd}</code>}
          </div>
        ))}
      </div>
    </div>
  );
});
SetupSection.displayName = "SetupSection";

const Lightbox = memo(({ images, currentIndex, onClose, onNavigate }) => {
  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onNavigate("prev", images.length);
    if (e.key === "ArrowRight") onNavigate("next", images.length);
  }, [onClose, onNavigate, images.length]);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return ReactDOM.createPortal(
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Visualizador de imagem em tela cheia">
      <button className="lightbox-close" onClick={onClose} aria-label="Fechar lightbox">✖</button>
      {hasMultiple && (
        <>
          <button className="lightbox-nav left" onClick={(e) => { e.stopPropagation(); onNavigate("prev", images.length); }} aria-label="Imagem anterior">❮</button>
          <button className="lightbox-nav right" onClick={(e) => { e.stopPropagation(); onNavigate("next", images.length); }} aria-label="Próxima imagem">❯</button>
        </>
      )}
      <div className="lightbox-content-wrapper" onClick={(e) => e.stopPropagation()}>
        <img src={currentImage.urlImagem} alt={currentImage.legenda ?? "Imagem em tela cheia"} className="lightbox-image" />
        {currentImage.legenda && <p className="lightbox-legend">{currentImage.legenda}</p>}
        {hasMultiple && <span className="lightbox-counter">{currentIndex + 1} / {images.length}</span>}
      </div>
    </div>,
    document.body
  );
});
Lightbox.displayName = "Lightbox";

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Projects = ({ token, userName, userRole }) => {
  const { projects, status, error } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeProject = projects[currentProjectIndex] ?? null;
  const { currentImageIndex, navigate: navigateImage } = useGallery(activeProject?.id);

  const { feedbacks, submitStatus, submitMsg, submitFeedback, deleteFeedback } =
    useFeedbacks(modalOpen ? activeProject?.id : null, token);

  const openModal = useCallback((index) => {
    setCurrentProjectIndex(index);
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setLightboxOpen(false);
  }, []);
  const goToNextProject = useCallback(() => {
    setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);
  const goToPrevProject = useCallback(() => {
    setCurrentProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  const canNavigate = projects.length > 1;

  if (status === "loading") {
    return <div className="projects-loading" role="status" aria-live="polite">Iniciando sistemas...</div>;
  }
  if (status === "error") {
    return <div className="projects-error" role="alert">⚠️ {error}</div>;
  }

  return (
    <section className="projects" aria-label="Projetos em Destaque">
      <h2>Projetos em Destaque</h2>

      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="static-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.5 0" />
            <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
            <feBlend mode="multiply" in="monoNoise" in2="SourceGraphic" result="blend" />
          </filter>
        </defs>
      </svg>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onClick={() => openModal(index)}
          />
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        {activeProject && (
          <div className="modal-shell">
            <nav className="modal-nav-bar" aria-label="Navegação entre projetos">
              <button className="modal-nav-btn" onClick={goToPrevProject} disabled={!canNavigate} aria-label="Projeto anterior">← Anterior</button>
              <span className="modal-nav-counter" aria-live="polite">{currentProjectIndex + 1} / {projects.length}</span>
              <button className="modal-nav-btn" onClick={goToNextProject} disabled={!canNavigate} aria-label="Próximo projeto">Próximo →</button>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Fechar modal">✕</button>
            </nav>

            <div className="modal-content">
              <h3 className="modal-title">{activeProject.title}</h3>

              <ImageCarousel
                images={activeProject.galeria}
                currentIndex={currentImageIndex}
                onNavigate={navigateImage}
                onExpand={() => setLightboxOpen(true)}
              />

              {activeProject.video && (
                <iframe
                  width="100%" height="315"
                  src={activeProject.video}
                  title={`Vídeo demonstração: ${activeProject.title}`}
                  frameBorder="0" allowFullScreen loading="lazy"
                />
              )}

              <div className="modal-description">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeProject.description}
                  </ReactMarkdown>
                </div>

                <TechSpecs techs={activeProject.techs} />
                <SetupSection setup={activeProject.setup} />

                {(activeProject.repositorioUrl || activeProject.liveUrl) && (
                  <ul className="modal-links">
                    {activeProject.repositorioUrl && (
                      <li><a href={activeProject.repositorioUrl} target="_blank" rel="noopener noreferrer">Ver código no GitHub →</a></li>
                    )}
                    {activeProject.liveUrl && (
                      <li><a href={activeProject.liveUrl} target="_blank" rel="noopener noreferrer">Acessar projeto ao vivo →</a></li>
                    )}
                  </ul>
                )}
              </div>

              <hr className="modal-divider" />

              <section className="project-feedback-section" aria-label="Avaliação do projeto">
                <h4>Avalie este projeto</h4>
                {!token ? (
                  <p className="login-prompt">Faça login no sistema para deixar um feedback.</p>
                ) : (
                  <FeedbackForm onSubmit={submitFeedback} submitStatus={submitStatus} submitMsg={submitMsg} />
                )}
              </section>

              <hr className="modal-divider" />

              <section className="project-feedbacks-list" aria-label="Feedbacks do projeto">
                <h4>Feedbacks sobre este projeto</h4>
                {feedbacks.length > 0 ? (
                  <ul>
                    {feedbacks.map((fb) => (
                      <FeedbackItem
                        key={fb.id}
                        feedback={fb}
                        canDelete={fb.userName === userName || userRole === "ADMIN3"}
                        onDelete={deleteFeedback}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="no-feedbacks">Ainda não há feedbacks para este projeto.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </Modal>

      {lightboxOpen && activeProject?.galeria?.length > 0 && (
        <Lightbox
          images={activeProject.galeria}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={navigateImage}
        />
      )}
    </section>
  );
};

export default Projects;