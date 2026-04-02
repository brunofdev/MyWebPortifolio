import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/articlefeedbackpanel.css";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ArticleFeedbackPanel = ({ articleId }) => {
  const { isAuthenticated, token } = useAuth();

  const [comment, setComment]       = useState("");
  const [rating, setRating]         = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState(null);
  
  const [feedbacks, setFeedbacks]     = useState([]);
  const [loadingFb, setLoadingFb]     = useState(false);


  useEffect(() => {
    if (articleId) fetchFeedbacks();
  }, [articleId]);

  const fetchFeedbacks = async () => {
    setLoadingFb(true);
    try {
      const res = await fetch(`${BASE_URL}/feedback/artigos/listar-todos/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.dados || data || []);
      }
    } catch (_) {
      console.error("Erro ao buscar feedbacks");
    } finally { 
      setLoadingFb(false); 
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) { setError("Faça login para avaliar."); return; }
    if (rating === 0) { setError("Selecione uma nota."); return; }
    if (comment.trim().length < 10) { setError("Mínimo de 10 caracteres."); return; }

    setSubmitting(true);
    setError(null);

    const payload = {
      descricao: comment.trim(),
      avaliacao: rating,
      tipoFeedback: "ARTIGO",
      referenciaId: articleId
    };

    try {
      const res = await fetch(`${BASE_URL}/feedback/artigos/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        setComment("");
        setRating(0);
        fetchFeedbacks(); // 🔄 Atualiza a lista após comentar
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.erros ? errData.erros[0] : (errData.message || "Erro ao enviar."));
      }
    } catch (_) {
      setError("Falha de conexão.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inline-feedback-card glass-panel">
      
      {/* ── SEÇÃO 1: LISTA (ACIMA) ── */}
      <div className="fbp-list-container">
        <div className="fbp-section-header">
          <h3>Feedbacks da Comunidade</h3>
          <span className="fbp-badge">{feedbacks.length}</span>
        </div>

        <div className="fbp-scroll-area">
          {loadingFb ? (
            <div className="fbp-info">Carregando opiniões...</div>
          ) : feedbacks.length === 0 ? (
            <div className="fbp-empty">Ninguém avaliou ainda. Seja o primeiro!</div>
          ) : (
            <ul className="fbp-list">
              {feedbacks.map((fb, i) => (
                <li key={fb.id || i} className="fbp-item animate-fadeIn">
                  <div className="fbp-item-header">
                    <span className="fbp-author">
                      {fb.fotoUsuario 
                        ? <img src={fb.fotoUsuario} alt="avatar" /> 
                        : <div className="fbp-avatar-placeholder">{fb.criadoPor ? fb.criadoPor[0] : '?'}</div>
                      }
                      {fb.userName || "Leitor"}
                    </span>
                    <div className="fbp-list-meta-group">
                      <span className="fbp-stars-display">
                        {"★".repeat(fb.notaAvaliacao || 0)}{"☆".repeat(5 - (fb.notaAvaliacao || 0))}
                      </span>
                    </div>
                  </div>
                  <p className="fbp-comment-text">{fb.comentario}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="fbp-divider" />

      {/* ── SEÇÃO 2: INPUT (ABAIXO) ── */}
      <div className="fbp-input-container">
        <div className="fbp-section-header">
          <h3>Deixe sua avaliação</h3>
        </div>

        {submitted ? (
          <div className="fbp-success-box">✨ Avaliação enviada com sucesso!</div>
        ) : (
          <div className="fbp-form">
            <div className="fbp-form-top">
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${rating >= star ? "star-btn--active" : ""}`}
                    onClick={() => setRating(star)}
                  >★</button>
                ))}
              </div>
            </div>

            <div className="comment-section">
              <textarea
                className="fbp-inline-textarea"
                placeholder="O que achou do conteúdo?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!isAuthenticated}
                rows="3"
              />
              {!isAuthenticated && (
                <div className="fbp-auth-overlay"><p>Faça login para avaliar</p></div>
              )}
            </div>

            {error && <p className="fbp-error-text">{error}</p>}

            <div className="fbp-actions">
              <button 
                className="btn-submit-feedback" 
                onClick={handleSubmit}
                disabled={submitting || !isAuthenticated || rating === 0 || comment.trim().length < 10}
              >
                {submitting ? "Enviando..." : "Enviar Comentário"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleFeedbackPanel;