import React, { useState, useEffect, useCallback } from 'react';
import '../styles/feedbacklist.css';

// Função utilitária para requisições com retry
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && response.status <= 502 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Número máximo de tentativas excedido.");
};

// --- Componente: Item de Feedback ---
const FeedbackItem = ({ feedback, colorClass, isAdmin, token, handleDelete }) => {
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
        <p className="feedback-item-username">{feedback.criadoPor || 'Usuário Anônimo'}</p>
        {renderRating(feedback.notaAvaliacao)}
        <p className="feedback-item-comment">{feedback.comentario || 'Sem comentário'}</p>
        <div className="feedback-time">{formatDateTime(feedback.dataDeCriacao)}</div>
        {isAdmin && (
          <button
            className="delete-button"
            onClick={() => handleDelete(feedback.id)}
            aria-label="Deletar feedback"
          >
            delete
          </button>
        )}
      </div>
    </div>
  );
};

// --- Componente: Lista de Feedbacks ---
const FeedbackList = ({ userRole, token }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:8080/feedback';
  const isAdmin = userRole === "ADMIN";

  // Função para buscar feedbacks
  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry(`${API_BASE}/listar-todos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Endpoint não encontrado. Verifique a URL da API.'
            : response.status >= 500
            ? 'Servidor indisponível após várias tentativas.'
            : `Erro ao buscar feedbacks: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const sortedFeedbacks = Array.isArray(data.dados)
        ? data.dados.sort((a, b) => {
            const dateA = a.time ? new Date(a.time).getTime() : 0;
            const dateB = b.time ? new Date(b.time).getTime() : 0;
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

  // Função para deletar feedback
  const handleDelete = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry(`${API_BASE}/deletefeedback/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Não autorizado para deletar.'
            : `Erro ao deletar feedback: ${response.status} ${response.statusText}`
        );
      }

      // Refetch após delete bem-sucedido
      fetchFeedbacks();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar feedback';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega feedbacks na montagem inicial
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Renderiza conteúdo condicional
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="loading-bar" />
          <p className="loading-text" aria-live="polite">Carregando feedbacks...</p>
        </>
      );
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
            key={fb.time + index}
            feedback={fb}
            colorClass={index % 2 === 0 ? '' : 'whatsapp-bubble-alt'}
            isAdmin={isAdmin}
            token={token}
            handleDelete={handleDelete}
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