import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import "../../styles/feedback.css";

const useBadWordsFilter = () => {
  const badWordsMap = useMemo(() => ({
    arrombado: "abençoado", boceta: "rosquinha", boquete: "beijinho", bosta: "docinho",
    bunda: "popozão", buceta: "rosquinha", cacete: "biscoito", caralho: "sorvete",
    carai: "caramba", cocô: "florzinha", cu: "docinho de coco", cuzão: "docinho grande",
    foder: "brincar", foda: "sensacional", gozar: "celebrar", merda: "brigadeiro",
    pau: "graveto", pinto: "pintinho", porra: "pipoca", puta: "estrela",
    putaria: "festa", rola: "pirulito", siririca: "carinho", xoxota: "borboleta",
  }), []);

  const replaceBadWords = useCallback((text) => {
    let filteredText = text;
    const foundBadWords = [];
    Object.keys(badWordsMap).forEach((badWord) => {
      const regex = new RegExp(`\\b${badWord}\\b`, "gi");
      if (regex.test(text)) {
        const upper = badWord.toUpperCase();
        if (!foundBadWords.includes(upper)) foundBadWords.push(upper);
        filteredText = filteredText.replace(regex, badWordsMap[badWord]);
      }
    });
    return { filteredText, foundBadWords };
  }, [badWordsMap]);

  return { replaceBadWords };
};

const useApiRequest = () => {
  const fetchWithRetry = useCallback(async (url, options, retries = 3, delay = 1200) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.status >= 500 && response.status <= 502 && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") throw new Error("Timeout");
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
    throw new Error("Falha na API.");
  }, []);
  return { fetchWithRetry };
};

const RATING_LABELS = ["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"];

const StarRow = memo(({ rating, hoverRating, onRate, onHover, onLeave }) => (
  <div className="fbf-stars">
    {[1, 2, 3, 4, 5].map((star) => {
      const active = star <= (hoverRating || rating);
      return (
        <button
          key={star}
          type="button"
          className={`fbf-star ${active ? "fbf-star--active" : ""}`}
          onClick={() => onRate(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
          aria-label={`${star} estrelas`}
        >
          <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </button>
      );
    })}
    <span className="fbf-rating-label">
      {RATING_LABELS[hoverRating || rating] || ""}
    </span>
  </div>
));
StarRow.displayName = "StarRow";

const SuccessScreen = memo(({ rating, comment, onReset }) => (
  <div className="fbf-success">
    <div className="fbf-success-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    </div>
    <span className="fbf-success-eyebrow">// feedback_enviado.json</span>
    <h3 className="fbf-success-title">Obrigado pelo retorno!</h3>
    <p className="fbf-success-sub">Sua avaliação foi registrada com sucesso.</p>

    <div className="fbf-success-card">
      <div className="fbf-success-row">
        <span className="fbf-success-key">nota</span>
        <div className="fbf-success-stars">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} className={`fbf-mini-star ${i < rating ? "fbf-mini-star--on" : ""}`} viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          ))}
          <span className="fbf-success-badge">{rating}.0</span>
        </div>
      </div>
      {comment && (
        <div className="fbf-success-row fbf-success-row--col">
          <span className="fbf-success-key">comentário</span>
          <p className="fbf-success-comment">"{comment}"</p>
        </div>
      )}
    </div>

    <button type="button" className="fbf-btn-ghost" onClick={onReset}>
      Enviar outro feedback
    </button>
  </div>
));
SuccessScreen.displayName = "SuccessScreen";

const AuthGate = memo(({ onOpen }) => (
  <div className="fbf-auth">
    <div className="fbf-auth-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>
    <p className="fbf-auth-text">Faça login para compartilhar sua experiência.</p>
    <button type="button" className="fbf-btn-primary" onClick={onOpen}>
      Entrar ou Cadastrar
    </button>
  </div>
));
AuthGate.displayName = "AuthGate";

const Feedback = ({ isAuthenticated, token, openAuthModal, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [charFocus, setCharFocus] = useState(false);

  const textareaRef = useRef(null);
  const { replaceBadWords } = useBadWordsFilter();
  const { fetchWithRetry } = useApiRequest();

  useEffect(() => {
    setSubmitted(false); setRating(0); setHoverRating(0);
    setComment(""); setSubmissionError(""); setWarning("");
  }, [token]);

  useEffect(() => {
    if (!warning) return;
    const t = setTimeout(() => setWarning(""), 4500);
    return () => clearTimeout(t);
  }, [warning]);

  const handleCommentChange = useCallback((e) => {
    const rawValue = e.target.value;
    if (rawValue.length > 1000) return;
    const { filteredText, foundBadWords } = replaceBadWords(rawValue);
    setComment(filteredText);
    if (foundBadWords.length > 0) setWarning(`Palavras suavizadas: ${foundBadWords.join(", ")} 😉`);
  }, [replaceBadWords]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return openAuthModal();
    if (rating === 0) return setSubmissionError("Selecione uma avaliação.");
    if (comment.trim().length < 10) return setSubmissionError("Mínimo de 10 caracteres.");

    setIsLoading(true);
    setSubmissionError("");
    try {
      const response = await fetchWithRetry(`${import.meta.env.VITE_API_URL}/feedback/geral/criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descricao: comment.trim(), avaliacao: rating, tipoFeedback: "GERAL", referenciaId: 0 }),
      });
      if (response.ok) {
        setSubmitted(true);
        onFeedbackSubmitted?.({ rating, comment: comment.trim() });
      } else {
        if (response.status === 401 || response.status === 403) {
          setSubmissionError("Sessão expirada. Faça login novamente.");
          setTimeout(openAuthModal, 1500);
        } else {
          setSubmissionError("Erro ao enviar feedback. Tente novamente.");
        }
      }
    } catch {
      setSubmissionError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = rating === 0 || comment.trim().length < 10 || isLoading || !isAuthenticated;
  const charPct = Math.round((comment.length / 1000) * 100);

  return (
    <div className="fbf-container">
      <div className="fbf-card">

        {isLoading && (
          <div className="fbf-progress-bar">
            <div className="fbf-progress-fill" />
          </div>
        )}

        <div className="fbf-header">
          <span className="fbf-eyebrow">// feedback.post()</span>
          <h2 className="fbf-title">Deixe sua Avaliação</h2>
          <p className="fbf-subtitle">Sua opinião constrói produtos melhores.</p>
        </div>

        {!isAuthenticated ? (
          <AuthGate onOpen={openAuthModal} />
        ) : submitted ? (
          <SuccessScreen rating={rating} comment={comment} onReset={() => setSubmitted(false)} />
        ) : (
          <form className="fbf-form" onSubmit={handleSubmit} noValidate>

            <div className="fbf-field">
              <label className="fbf-label">Nota</label>
              <StarRow
                rating={rating}
                hoverRating={hoverRating}
                onRate={(s) => { setRating(s); setSubmissionError(""); }}
                onHover={setHoverRating}
                onLeave={() => setHoverRating(0)}
              />
            </div>

            <div className="fbf-field">
              <label className="fbf-label">Comentário</label>
              <div className={`fbf-textarea-wrap ${charFocus ? "fbf-textarea-wrap--focus" : ""}`}>
                <textarea
                  ref={textareaRef}
                  className="fbf-textarea"
                  placeholder="Conte-nos o que achou..."
                  value={comment}
                  onChange={handleCommentChange}
                  onFocus={() => setCharFocus(true)}
                  onBlur={() => setCharFocus(false)}
                  maxLength={1000}
                  required
                />
                <div className="fbf-textarea-footer">
                  <span className="fbf-helper">Mínimo 10 caracteres</span>
                  <div className="fbf-char-track">
                    <div className="fbf-char-bar" style={{ width: `${charPct}%`, background: charPct > 90 ? '#f87171' : charPct > 70 ? '#fbbf24' : '#4ade80' }} />
                    <span className="fbf-char-count">{comment.length}/1000</span>
                  </div>
                </div>
              </div>
            </div>

            {submissionError && (
              <div className="fbf-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {submissionError}
              </div>
            )}

            <button type="submit" className="fbf-btn-primary" disabled={isSubmitDisabled}>
              {isLoading ? (
                <>
                  <svg className="fbf-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  Enviar Feedback
                </>
              )}
            </button>

          </form>
        )}
      </div>

      {warning && (
        <div className="fbf-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {warning}
        </div>
      )}
    </div>
  );
};

export default memo(Feedback);