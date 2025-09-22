import React, { useState, useEffect } from 'react';
import '../styles/feedbacklist.css';

// --- Componente: Item de Feedback (Estilo WhatsApp) ---
const FeedbackItem = ({ feedback }) => {
  // Formata a data para exibir apenas a hora e os minutos
  const formatTime = (dateString) => {
    if (!dateString) {
      console.warn('Data inválida recebida em FeedbackItem:', { feedback });
      return 'Data não disponível';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida recebida em FeedbackItem:', { dateString, feedback });
        return 'Data não disponível';
      }
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Erro ao formatar data em FeedbackItem:', { error, feedback });
      return 'Data não disponível';
    }
  };

  // Valida userRating para evitar erros
  const userRating = Math.max(0, Math.min(5, Number(feedback.userRating) || 0));

  return (
    <div className="whatsapp-bubble-container">
      <div className="whatsapp-bubble">
        <div className="feedback-item-rating">
          {'★'.repeat(userRating)}
          {'☆'.repeat(5 - userRating)}
        </div>
        <p className="feedback-item-comment">{feedback.userFeedback || 'Sem comentário'}</p>
        <div className="feedback-time">{formatTime(feedback.time)}</div>
      </div>
    </div>
  );
};

// --- Componente: Lista de Feedbacks ---
const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar os feedbacks
  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null); // Limpa erros anteriores
    try {
      const response = await fetch('https://microservice-feedback.onrender.com/feedback/listar-todos', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint não encontrado. Verifique a configuração do backend.');
        }
        throw new Error(`Erro ao buscar feedbacks: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Ordena os feedbacks por data (do mais recente ao mais antigo)
      const sortedFeedbacks = Array.isArray(data)
        ? data.sort((a, b) => {
            const dateA = a.time ? new Date(a.time) : new Date(0); // Usa epoch para undefined
            const dateB = b.time ? new Date(b.time) : new Date(0);
            return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
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

  // Carrega os feedbacks na montagem inicial
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Componente auxiliar para renderizar o conteúdo condicional
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