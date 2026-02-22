import React, { useState, useEffect, useCallback } from 'react';
import '../styles/feedbacklist.css';

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
  throw new Error("Erro de conexão persistente.");
};

const FeedbackItem = ({ feedback, colorClass, isAdmin, token, handleDelete }) => {
  
  // ATENÇÃO: Os nomes abaixo devem ser IGUAIS aos do seu FeedbackDTO no Java
  const { 
    id, 
    comentario,   
    notaAvaliacao,       
    dataDeCriacao,  
    criadoPor,      
    fotoUsuario  
  } = feedback;

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return 'Data não disponível'; }
  }, []);

  const renderRating = useCallback((ratingValue) => {
    const val = Math.max(1, Math.min(5, Number(ratingValue) || 1));
    return (
      <div className="feedback-item-rating">
        <span className="full-stars">{'★'.repeat(val)}</span>
        <span className="empty-stars">{'☆'.repeat(5 - val)}</span>
      </div>
    );
  }, []);

  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const userPhoto = fotoUsuario || defaultAvatar;

  return (
    <div className="whatsapp-bubble-container">
      <div className={`whatsapp-bubble ${colorClass}`} role="article">
        <div className="feedback-header">
          <img src={userPhoto} alt={criadoPor || 'Usuário'} className="feedback-avatar" />
          <div className="feedback-user-info">
            <p className="feedback-item-username">{criadoPor || 'Usuário'}</p>
            {renderRating(notaAvaliacao)}
          </div>
        </div>

        <p className="feedback-item-comment">{comentario || 'Sem comentário'}</p>
        <div className="feedback-time">{formatDateTime(dataDeCriacao)}</div>
        
        {isAdmin && (
          <button className="delete-button" onClick={() => handleDelete(id)}>
            delete
          </button>
        )}
      </div>
    </div>
  );
};

const FeedbackList = ({ userRole, token }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = 'https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/feedback';
  
  // Verificação de admin mais flexível (pega ADMIN1, ADMIN3, etc)
  const isAdmin = userRole && userRole.includes("ADMIN");

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithRetry(`${API_BASE}/listar-todos`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error("Erro ao carregar feedbacks.");

      const data = await response.json();
      // O DTO já vem ordenado do banco, então apenas salvamos
      setFeedbacks(Array.isArray(data.dados) ? data.dados : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente apagar?")) return;
    try {
      const response = await fetch(`${API_BASE}/deletefeedback/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchFeedbacks();
    } catch (err) {
      alert("Erro ao deletar.");
    }
  };

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  return (
    <section className="feedback-list-container">
      <div className="feedback-list-header">
        <h2 className="feedback-list-title">Feedbacks Recebidos</h2>
        <button className="reload-button" onClick={fetchFeedbacks} disabled={isLoading}>
          {isLoading ? '...' : 'Recarregar'}
        </button>
      </div>

      {isLoading ? (
        <p className="loading-text">Carregando...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : feedbacks.length === 0 ? (
        <p className="no-feedback-text">Nenhum feedback encontrado.</p>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((fb, index) => (
            <FeedbackItem
              key={fb.id || index}
              feedback={fb}
              colorClass={index % 2 === 0 ? '' : 'whatsapp-bubble-alt'}
              isAdmin={isAdmin}
              token={token}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeedbackList;