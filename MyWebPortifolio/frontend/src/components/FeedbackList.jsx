import React, { useState, useEffect, useCallback } from 'react';
import '../styles/feedbacklist.css';

// --- Utilitário de API ---
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

// --- Sub-componente: Item da Lista ---
const FeedbackItem = ({ feedback, colorClass, isAdmin, currentUserName, handleDelete }) => {
  // 1. Desestruturamos a nova propriedade isAnonimo do DTO
  const { id, comentario, notaAvaliacao, dataDeCriacao, criadoPor, userName, fotoUsuario, isAnonimo } = feedback;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data não disponível' : 
      date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderRating = (val) => {
    const stars = Math.max(1, Math.min(5, Number(val) || 1));
    return (
      <div className="feedback-item-rating">
        <span className="full-stars">{'★'.repeat(stars)}</span>
        <span className="empty-stars">{'☆'.repeat(5 - stars)}</span>
      </div>
    );
  };

  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  // ==========================================
  // 🎭 A MÁGICA DA MÁSCARA (ANONIMATO)
  // ==========================================
  const nomeExibicao = isAnonimo ? "Anônimo" : (criadoPor || 'Usuário');
  const fotoExibicao = isAnonimo ? defaultAvatar : (fotoUsuario || defaultAvatar);

  // 🔐 REGRA DE SEGURANÇA:
  // A validação de quem pode deletar continua usando o 'criadoPor' real vindo do banco!
  const podeDeletar = isAdmin || (currentUserName && currentUserName === userName);

  return (
    <div className="whatsapp-bubble-container">
      <div className={`whatsapp-bubble ${colorClass}`} role="article">
        <div className="feedback-header">
          {/* Usamos a foto mascarada */}
          <img src={fotoExibicao} alt={nomeExibicao} className="feedback-avatar" />
          <div className="feedback-user-info">
            {/* Usamos o nome mascarado */}
            <p className="feedback-item-username">{nomeExibicao}</p>
            {renderRating(notaAvaliacao)}
          </div>
        </div>
        <p className="feedback-item-comment">{comentario || 'Sem comentário'}</p>
        <div className="feedback-time">{formatDateTime(dataDeCriacao)}</div>
        
        {/* Renderização Condicional do Botão */}
        {podeDeletar && (
          <button className="delete-button" onClick={() => handleDelete(id)}>delete</button>
        )}
      </div>
    </div>
  );
};

// --- Componente Principal ---
// Adicionada a prop refreshTrigger para a lista se auto-atualizar
const FeedbackList = ({ userRole, token, currentUserName, refreshTrigger }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificamos se é ADMIN3
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

  // 👈 O fetchFeedbacks será chamado ao montar o componente ou sempre que refreshTrigger mudar!
  useEffect(() => { 
    fetchFeedbacks(); 
  }, [fetchFeedbacks, refreshTrigger]);

  return (
    <section className="feedback-list-container">
      <div className="feedback-list-header">
        <h2 className="feedback-list-title">Feedbacks Recebidos</h2>
        <button className="reload-button" onClick={fetchFeedbacks} disabled={isLoading}>
          {isLoading ? '...' : 'Recarregar'}
        </button>
      </div>

      {isLoading ? <p className="loading-text">Carregando...</p> : 
       error ? <p className="error-text">{error}</p> : 
       feedbacks.length === 0 ? <p className="no-feedback-text">Nenhum feedback encontrado.</p> : (
        <div className="feedback-list">
          {feedbacks.map((fb, i) => (
            <FeedbackItem 
              key={fb.id || i} 
              feedback={fb} 
              isAdmin={isAdmin} 
              currentUserName={currentUserName} 
              handleDelete={handleDelete} 
              colorClass={i % 2 === 0 ? '' : 'whatsapp-bubble-alt'} 
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default FeedbackList;