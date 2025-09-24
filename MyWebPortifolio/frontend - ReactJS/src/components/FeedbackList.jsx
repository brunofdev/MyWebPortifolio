import React, { useState, useEffect } from 'react';
import '../styles/feedbacklist.css';

// --- Componente: Item de Feedback (Estilo WhatsApp) ---
const FeedbackItem = ({ feedback, colorClass }) => {
    // Função para formatar a data para exibir data e hora completa
    const formatDateTime = (dateString) => {
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
            // Formata para exibir data e hora
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
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
            <div className={`whatsapp-bubble ${colorClass}`}>
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

    // URL da sua API no Render
    const API_URL = 'https://microservice-feedback.onrender.com/feedback/listar-todos';

    // Função para buscar os feedbacks
    const fetchFeedbacks = async () => {
        setIsLoading(true);
        setError(null); // Limpa erros anteriores
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
            // Ordena os feedbacks por data (do mais recente ao mais antigo)
            const sortedFeedbacks = Array.isArray(data)
                ? data.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
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
                        colorClass={index % 2 === 0 ? '' : 'whatsapp-bubble-alt'}
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
