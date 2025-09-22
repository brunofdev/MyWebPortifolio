import React, { useState, useEffect } from 'react';
import '../styles/feedbacklist.css';

// --- Componente: Item de Feedback (Estilo WhatsApp) ---
const FeedbackItem = ({ feedback }) => {
  // Função para formatar a data para exibir data e hora completa
  const formatDateTime = (dateString) => {
    if (!dateString) {
      console.warn('Data inválida recebida em FeedbackItem:', { feedback });
      return 'Data não disponível';
    }
    try {
      // O Spring Boot retorna a data e hora no formato ISO 8601,
      // que o construtor do Date() entende perfeitamente.
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida recebida em FeedbackItem:', { dateString, feedback });
        return 'Data não disponível';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.warn('Erro ao formatar data em FeedbackItem:', { error, feedback });
      return 'Data não disponível';
    }
  };

  // Renderiza as estrelas de avaliação dinamicamente
  const renderRating = (rating) => {
    // Garante que a nota seja um número entre 1 e 5
    const validatedRating = Math.max(1, Math.min(5, Number(rating) || 1));
    const fullStars = '★'.repeat(validatedRating);
    const emptyStars = '☆'.repeat(5 - validatedRating);
    return (
      <div className="feedback-item-rating">
        <span className="full-stars">{fullStars}</span>
        <span className="empty-stars">{emptyStars}</span>
      </div>
    );
  };

  return (
    <div className="whatsapp-bubble-container">
      <div className="whatsapp-bubble">
        {renderRating(feedback.userRating)}
        <p className="feedback-item-comment">{feedback.userFeedback || 'Sem comentário'}</p>
        <div className="feedback-time">{formatDateTime(feedback.time)}</div>
      </div>
    </div>
  );
};

// --- Componente: Lista de Feedbacks ---
const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL da sua API no Render
  const API_URL = 'https://microservice-feedback.onrender.com/feedback/listar-todos';

  // Função para buscar os feedbacks
  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint não encontrado. Verifique a URL da API.');
        }
        throw new Error(`Erro ao buscar feedbacks: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const sortedFeedbacks = Array.isArray(data)
        ? data.sort((a, b) => {
            const dateA = a.time ? new Date(a.time) : new Date(0);
            const dateB = b.time ? new Date(b.time) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          })
        : [];
      setFeedbacks(sortedFeedbacks);
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError(err.message || 'Erro ao carregar feedbacks');
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p className="loading-text">Carregando feedbacks...</p>;
    }
    if (error) {
      return <p className="error-text">{error}</p>;
    }
    if (feedbacks.length === 0) {
      return <p className="no-feedback-text">Ainda não há feedbacks. Seja o primeiro a enviar!</p>;
    }
    return (
      <div className="feedback-list">
        {feedbacks.map((fb, index) => (
          <FeedbackItem
            key={fb.id || `feedback-${index}`}
            feedback={fb}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="feedback-list-container">
      <div className="feedback-list-header">
        <h2 className="feedback-list-title">Feedbacks Recebidos</h2>
        <button
          className="reload-button"
          onClick={fetchFeedbacks}
          disabled={isLoading}
        >
          {isLoading ? 'Carregando...' : 'Recarregar Feedbacks'}
        </button>
      </div>
      {renderContent()}
    </section>
  );
};

export default FeedbackList;
