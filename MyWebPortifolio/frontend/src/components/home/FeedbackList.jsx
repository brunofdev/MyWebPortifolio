import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/feedbacklist.css';

const API_BASE = `${import.meta.env.VITE_API_URL}/feedback/geral`;

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
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
  throw new Error("Erro de conexão persistente.");
};

const StarRating = ({ value }) => {
  const stars = Math.max(1, Math.min(5, Number(value) || 1));
  return (
    <div className="fb-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`fb-star ${i < stars ? 'fb-star--filled' : 'fb-star--empty'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  );
};

const RatingBadge = ({ value }) => {
  const stars = Math.max(1, Math.min(5, Number(value) || 1));
  const colors = {
    1: 'fb-badge--red',
    2: 'fb-badge--orange',
    3: 'fb-badge--yellow',
    4: 'fb-badge--teal',
    5: 'fb-badge--green',
  };
  return (
    <span className={`fb-rating-badge ${colors[stars]}`}>
      {stars}.0
    </span>
  );
};

const FeedbackItem = ({ feedback, isAdmin, currentUserName, handleDelete, index }) => {
  const { id, comentario, notaAvaliacao, dataDeCriacao, userName, fotoUsuario, isAnonimo, criadoPor } = feedback;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data não disponível' :
      date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const nomeExibicao = isAnonimo ? "Anônimo" : (criadoPor || 'Usuário');
  const fotoExibicao = isAnonimo ? defaultAvatar : (fotoUsuario || defaultAvatar);
  const podeDeletar = isAdmin || (currentUserName && currentUserName === userName);

  const initials = nomeExibicao.slice(0, 2).toUpperCase();

  return (
    <article className="fb-card" style={{ animationDelay: `${index * 60}ms` }}>

      <div className="fb-card-side">
        <div className="fb-avatar-wrap">
          <img
            src={fotoExibicao}
            alt={nomeExibicao}
            className="fb-avatar"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="fb-avatar-fallback" style={{ display: 'none' }}>{initials}</div>
        </div>
        <div className="fb-card-line" />
      </div>

      <div className="fb-card-body">
        <div className="fb-card-top">
          <div className="fb-user-block">
            <span className="fb-username">{nomeExibicao}</span>
            {isAnonimo && (
              <span className="fb-anon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                anônimo
              </span>
            )}
          </div>
          <div className="fb-meta-right">
            <RatingBadge value={notaAvaliacao} />
            {podeDeletar && (
              <button className="fb-delete-btn" onClick={() => handleDelete(id)} title="Excluir feedback">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <StarRating value={notaAvaliacao} />

        <p className="fb-comment">{comentario || 'Sem comentário.'}</p>

        <div className="fb-footer">
          <svg className="fb-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="fb-date">{formatDateTime(dataDeCriacao)}</span>
        </div>
      </div>
    </article>
  );
};

const FeedbackList = ({ userRole, token, currentUserName, refreshTrigger }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = userRole === "ADMIN3" || userRole?.includes("ADMIN3");

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry(`${API_BASE}/listar-todos`, { method: 'GET' });
      if (!response.ok) throw new Error("Erro ao carregar feedbacks.");
      const data = await response.json();
      setFeedbacks(Array.isArray(data.dados) ? data.dados : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente apagar este feedback?")) return;
    try {
      const resp = await fetch(`${API_BASE}/excluir/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (resp.ok) {
        fetchFeedbacks();
      } else {
        alert("Erro: Você não tem permissão para apagar este feedback.");
      }
    } catch {
      alert("Erro ao tentar conectar com o servidor.");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks, refreshTrigger]);

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((acc, fb) => acc + (Number(fb.notaAvaliacao) || 0), 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <section className="fb-container">

      <div className="fb-header">
        <div className="fb-header-left">
          <span className="fb-eyebrow">// avaliações</span>
          <h2 className="fb-title">Feedbacks Recebidos</h2>
          {avgRating && (
            <div className="fb-summary">
              <span className="fb-summary-score">{avgRating}</span>
              <div className="fb-summary-detail">
                <StarRating value={Math.round(avgRating)} />
                <span className="fb-summary-count">{feedbacks.length} avaliação{feedbacks.length !== 1 ? 'ões' : ''}</span>
              </div>
            </div>
          )}
        </div>
        <button className="fb-reload-btn" onClick={fetchFeedbacks} disabled={isLoading}>
          <svg
            className={isLoading ? 'fb-spin' : ''}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {isLoading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      {isLoading && (
        <div className="fb-state">
          <div className="fb-skeleton" />
          <div className="fb-skeleton fb-skeleton--short" />
          <div className="fb-skeleton" />
        </div>
      )}

      {!isLoading && error && (
        <div className="fb-state fb-state--error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{error}</p>
          <button className="fb-retry-btn" onClick={fetchFeedbacks}>Tentar novamente</button>
        </div>
      )}

      {!isLoading && !error && feedbacks.length === 0 && (
        <div className="fb-state fb-state--empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <p>Nenhum feedback encontrado ainda.</p>
        </div>
      )}

      {!isLoading && !error && feedbacks.length > 0 && (
        <div className="fb-list">
          {feedbacks.map((fb, i) => (
            <FeedbackItem
              key={fb.id || i}
              feedback={fb}
              index={i}
              isAdmin={isAdmin}
              currentUserName={currentUserName}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default FeedbackList;