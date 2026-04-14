import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/articlefeedbackpanel.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/* ─────────────────────────────────────────
   UTILITÁRIO: fetch com retry (3 tentativas)
───────────────────────────────────────── */
const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && response.status <= 502 && attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Número máximo de tentativas excedido.");
};

/* ─────────────────────────────────────────
   SUB-COMPONENTE: Item de feedback
───────────────────────────────────────── */
const FeedbackItem = ({ feedback, onDelete, canDelete }) => {
  const { id, comentario, notaAvaliacao, criadoPor, userName, fotoUsuario, isAnonimo } = feedback;

  const defaultAvatar =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const nomeExibicao = isAnonimo ? "Anônimo" : criadoPor || "Leitor";
  const fotoExibicao = isAnonimo ? defaultAvatar : fotoUsuario || null;
  const inicial = nomeExibicao[0]?.toUpperCase() || "?";

  const stars = Math.max(0, Math.min(5, Number(notaAvaliacao) || 0));

  return (
    <li className="fbp-item animate-fadeIn">
      <div className="fbp-item-header">
        <span className="fbp-author">
          {fotoExibicao ? (
            <img src={fotoExibicao} alt={nomeExibicao} />
          ) : (
            <div className="fbp-avatar-placeholder">{inicial}</div>
          )}
          {nomeExibicao}
        </span>

        <div className="fbp-list-meta-group">
          <span className="fbp-stars-display">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          </span>
        </div>
      </div>

      <p className="fbp-comment-text">{comentario || "Sem comentário."}</p>

      {canDelete && (
        <div className="fbp-item-actions">
          <button
            className="fbp-delete-btn"
            onClick={() => onDelete(id)}
            title="Excluir feedback"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Excluir
          </button>
        </div>
      )}
    </li>
  );
};

/* ─────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────── */
const ArticleFeedbackPanel = ({ articleId }) => {
  const { isAuthenticated, token, userRole, userName } = useAuth();

  const isAdmin = userRole === "ADMIN3" || userRole?.includes("ADMIN3");

  // ── Form state
  const [comment, setComment]     = useState("");
  const [rating, setRating]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState(null);

  // ── List state
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loadingFb, setLoadingFb]   = useState(false);
  const [listError, setListError]   = useState(null);

  /* ── Busca feedbacks ── */
  const fetchFeedbacks = useCallback(async () => {
    if (!articleId) return;
    setLoadingFb(true);
    setListError(null);
    try {
      const res = await fetchWithRetry(
        `${BASE_URL}/feedback/artigos/listar-todos/${articleId}`
      );
      if (!res.ok) throw new Error("Falha ao carregar feedbacks.");
      const data = await res.json();
      setFeedbacks(data.dados || data || []);
    } catch (err) {
      setListError(err.message || "Erro ao buscar feedbacks.");
    } finally {
      setLoadingFb(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  /* ── Submete novo feedback ── */
  const handleSubmit = async () => {
    if (!isAuthenticated) { setError("Faça login para avaliar."); return; }
    if (rating === 0)      { setError("Selecione uma nota.");     return; }
    if (comment.trim().length < 10) { setError("Mínimo de 10 caracteres."); return; }

    setSubmitting(true);
    setError(null);

    const payload = {
      descricao:     comment.trim(),
      avaliacao:     rating,
      tipoFeedback:  "ARTIGO",
      referenciaId:  articleId,
    };

    try {
      const res = await fetchWithRetry(`${BASE_URL}/feedback/artigos/criar`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        setComment("");
        setRating(0);
        await fetchFeedbacks(); // 🔄 Re-renderiza a lista imediatamente
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(
          errData.erros?.[0] || errData.message || "Erro ao enviar."
        );
      }
    } catch {
      setError("Falha de conexão.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Deleta feedback ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este feedback?")) return;

    try {
      const res = await fetch(`${BASE_URL}/feedback/artigos/excluir/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Otimista: remove localmente sem precisar de novo fetch
        setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
      } else {
        alert("Você não tem permissão para excluir este feedback.");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    }
  };

  /* ── Regra de quem pode deletar cada item ── */
  const canDeleteItem = (fb) => {
    if (isAdmin) return true;                          // ADMIN3 deleta tudo
    if (!isAuthenticated || !userName) return false;
    return userName === fb.userName;                   // dono do feedback
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
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
          ) : listError ? (
            <div className="fbp-error-text">{listError}</div>
          ) : feedbacks.length === 0 ? (
            <div className="fbp-empty">Ninguém avaliou ainda. Seja o primeiro!</div>
          ) : (
            <ul className="fbp-list">
              {feedbacks.map((fb, i) => (
                <FeedbackItem
                  key={fb.id ?? i}
                  feedback={fb}
                  onDelete={handleDelete}
                  canDelete={canDeleteItem(fb)}
                />
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
                  >
                    ★
                  </button>
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
                <div className="fbp-auth-overlay">
                  <p>Faça login para avaliar</p>
                </div>
              )}
            </div>

            {error && <p className="fbp-error-text">{error}</p>}

            <div className="fbp-actions">
              <button
                className="btn-submit-feedback"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !isAuthenticated ||
                  rating === 0 ||
                  comment.trim().length < 10
                }
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
