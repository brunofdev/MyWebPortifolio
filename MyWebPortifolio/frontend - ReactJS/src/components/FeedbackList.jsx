import React, { useState, useEffect, useCallback } from 'react';
import '../styles/feedbacklist.css';

// --- Componente: Item de Feedback ---
const FeedbackItem = ({ feedback, colorClass }) => {
  // Formata a data para exibição
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data não disponível';
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data não disponível';
    }
  }, []);

  // Renderiza as estrelas de avaliação
  const renderRating = useCallback((rating) => {
    const validatedRating = Math.max(1, Math.min(5, Number(rating) || 1));
    const fullStars = '★'.repeat(validatedRating);
    const emptyStars = '☆'.repeat(5 - validatedRating);
    return (
      <div className="feedback-item-rating" aria-label={`Avaliação de ${validatedRating} estrelas`}>
        <span className="full-stars">{fullStars}</span>
        <span className="empty-stars">{emptyStars}</span>
      </div>
    );
  }, []);

  return (
    <div className="whatsapp-bubble-container">
      <div className={`whatsapp-bubble ${colorClass}`} role="article">
        <p className="feedback-item-username">{feedback.userName || 'Usuário Anônimo'}</p>
        {renderRating(feedback.userRating)}
        <p className="feedback-item-comment">{feedback.userFeedback || 'Sem comentário'}</p>
        <div className="feedback-time">{formatDateTime(feedback.createdAt)}</div>
      </div>
    </div>
  );
};

// --- Componente: Lista de Feedbacks ---
const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'https://microservice-feedback.onrender.com/feedbackservice/getallfeedbacks';

  // Função para buscar feedbacks
  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Endpoint não encontrado. Verifique a URL da API.'
            : `Erro ao buscar feedbacks: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const sortedFeedbacks = Array.isArray(data)
        ? data.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Mais recente primeiro
          })
        : [];
      setFeedbacks(sortedFeedbacks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar feedbacks';
      setError(message);
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carrega feedbacks na montagem inicial
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Renderiza conteúdo condicional
  const renderContent = () => {
    if (isLoading) {
      return <p className="loading-text" aria-live="polite">Carregando feedbacks...</p>;
    }
    if (error) {
      return <p className="error-text" aria-live="assertive">{error}</p>;
    }
    if (feedbacks.length === 0) {
      return (
        <p className="no-feedback-text" aria-live="polite">
          Ainda não há feedbacks. Seja o primeiro a enviar!
        </p>
      );
    }
    return (
      <div className="feedback-list" role="list">
        {feedbacks.map((fb, index) => (
          <FeedbackItem
            key={fb.createdAt + index} // Usar createdAt + index para evitar chaves duplicadas
            feedback={fb}
            colorClass={index % 2 === 0 ? '' : 'whatsapp-bubble-alt'}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="feedback-list-container" aria-labelledby="feedback-list-title">
      <div className="feedback-list-header">
        <h2 id="feedback-list-title" className="feedback-list-title">
          Feedbacks Recebidos
        </h2>
        <button
          className="reload-button"
          onClick={fetchFeedbacks}
          disabled={isLoading}
          aria-label={isLoading ? 'Carregando feedbacks' : 'Recarregar feedbacks'}
        >
          {isLoading ? 'Carregando...' : 'Recarregar Feedbacks'}
        </button>
      </div>
      {renderContent()}
    </section>
  );
};

export default FeedbackList;