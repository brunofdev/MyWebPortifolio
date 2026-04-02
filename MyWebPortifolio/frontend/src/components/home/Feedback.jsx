import React, { useState, useEffect } from "react";
import "../../styles/feedback.css";

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

const Feedback = ({ isAuthenticated, token, openAuthModal }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const badWords = {
    arrombado: "abençoado",
    boceta: "rosquinha",
    boquete: "beijinho",
    bosta: "docinho",
    bunda: "popozão",
    buceta: "rosquinha",
    cacete: "biscoito",
    caralho: "sorvete",
    carai: "caramba",
    cocô: "florzinha",
    cu: "docinho de coco",
    cuzão: "docinho grande",
    foder: "brincar",
    foda: "sensacional",
    gozar: "celebrar",
    merda: "brigadeiro",
    pau: "graveto",
    pepeka: "serelepe",
    perereca: "serelepe",
    perereka: "serelepe",
    pinto: "pintinho",
    ppk: "serelepe",
    porra: "pipoca",
    punheta: "carinho",
    puta: "estrela",
    putaria: "festa",
    putinha: "estrelinha",
    putão: "super estrela",
    rola: "pirulito",
    siririca: "carinho",
    tico: "tico-tico",
    xoxota: "borboleta",
    xoxóta: "borboleta",
    bagos: "bolinhas",
    cabaço: "novato",
    caralha: "sorvetão",
    chana: "florzona",
    kacete: "biscoitão",
    mandioca: "cenourinha",
    pica: "gravetão",
    pintelho: "peninha",
    rabo: "caudinha",
    trepar: "dançar",
    xana: "borboletinha",
    asno: "líder",
    babaca: "herói",
    bixa: "pessoa animada",
    bixinha: "pessoa animada",
    bixona: "pessoa animada",
    burrice: "desafio",
    burro: "gênio",
    cabrão: "carinha",
    canalha: "travesso",
    carneiro: "ovelhinha",
    chato: "curioso",
    chifrudo: "desprevenido",
    corno: "sortudo",
    cretino: "bobalhão",
    desgraça: "alegria",
    droga: "puxa vida",
    esquisito: "único",
    fanfarrão: "engraçadinho",
    fdp: "filho da estrela",
    filho_da_puta: "filho da estrela",
    fracassado: "vencedor",
    gay: "pessoa alegre",
    idiota: "sábio",
    imbecil: "inteligente",
    jumento: "mestre",
    ladrão: "iluminado",
    lixo: "tesouro",
    maldito: "levado",
    mané: "guerreiro",
    mongol: "atleta",
    nego: "luz",
    nojento: "diferente",
    otário: "campeão",
    palhaçada: "brincadeira",
    palhaço: "artista",
    pequepe: "peixinho",
    piolho: "pequenino",
    pqp: "uau",
    retardado: "esperto",
    ridículo: "divertido",
    safado: "malandro",
    tonto: "desatento",
    trouxa: "ingênuo",
    vadia: "amiga",
    vagabundo: "trabalhador",
    viadagem: "animação",
    viadão: "pessoa animada",
    viadinho: "pessoa animada",
    viado: "pessoa animada",
    zé_ruela: "camarada",
    baitola: "pessoa festiva",
    beócio: "sabichão",
    canalhice: "travessura",
    capadócio: "espertalhão",
    corno_manso: "sortudo tranquilo",
    cuzona: "docinho gigante",
    débil: "pensador",
    escroto: "joia rara",
    fedido: "aromático",
    fuleco: "artista",
    fuleiro: "charmeiro",
    gado: "fã",
    lazarento: "especial",
    lesado: "descolado",
    moleque: "jovem",
    panaca: "amigão",
    patife: "espertinho",
    pentelho: "detalhista",
    pilantra: "astuto",
    pulha: "brincalhão",
    sacana: "zoador",
    salafrário: "malandrete",
    sem_noção: "aventureiro",
    traste: "tesourinho",
    xarope: "doce",
    zoiudo: "curioso",
  };

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/(.)\1+/g, "$1");

  const replaceBadWords = (text) => {
    let filteredText = text;
    const foundBadWords = [];

    for (const badWord in badWords) {
      const regex = new RegExp(`\\b${badWord}\\b`, "gi");
      if (text.match(regex)) {
        if (!foundBadWords.includes(badWord.toUpperCase())) {
          foundBadWords.push(badWord.toUpperCase());
        }
        filteredText = filteredText.replace(regex, badWords[badWord]);
      }
    }

    if (foundBadWords.length > 0) {
      setWarning(
        `Ei! Palavras como "${foundBadWords.join(", ")}" foram trocadas por algo mais amigável 😉`
      );
    }

    return filteredText;
  };

  // ==========================================
  // 🧹 NOVO: LIMPEZA DA MESA AO MUDAR USUÁRIO
  // ==========================================
  useEffect(() => {
    // Se o token mudar (usuário deslogou ou outro usuário logou), reseta tudo para o estado inicial
    setSubmitted(false);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setSubmissionError("");
    setWarning("");
  }, [token]);
  // ==========================================

  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    if (e.target.value.length <= 1000) {
      const newValue = replaceBadWords(e.target.value);
      setComment(newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setSubmissionError("Você precisa estar logado para enviar um feedback.");
      openAuthModal();
      return;
    }
    if (rating === 0) {
      setSubmissionError("Por favor, selecione uma avaliação com estrelas.");
      return;
    }
    if (!comment.trim()) {
      setSubmissionError("O comentário não pode estar vazio.");
      return;
    }
    if (comment.trim().length < 10) {
      setSubmissionError("O comentário deve ter no mínimo 10 caracteres.");
      return;
    }

    setIsLoading(true);
    setSubmissionError("");

    const feedbackData = {
      descricao: comment,
      avaliacao: rating,
      tipoFeedback: "GERAL",
      referenciaId: 0,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetchWithRetry(
        `${import.meta.env.VITE_API_URL}/feedback/geral/criar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(feedbackData),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        if (response.status === 401 || response.status === 403) {
          setSubmissionError("Sessão expirada ou token inválido. Faça login novamente.");
          setTimeout(() => {
            openAuthModal();
          }, 2000);
        } else if (response.status >= 500) {
          setSubmissionError("Servidor indisponível após várias tentativas.");
        } else {
          setSubmissionError(
            data?.erro?.message || "Ocorreu um erro ao enviar o feedback."
          );
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setSubmissionError("A requisição demorou muito. Tente novamente.");
      } else {
        console.error("Erro de conexão:", error);
        setSubmissionError(
          "Erro de conexão com o servidor. Verifique sua internet e tente novamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="feedback-container">
        <section className="feedback animate-fadeIn">
          <h2>Deixe seu Feedback</h2>
          <h3>(Ajude-nos a melhorar!)</h3>
          {isLoading && <div className="loading-bar" />}
          {!isAuthenticated ? (
            <div className="auth-required animate-fadeIn">
              <p>Você precisa estar logado para enviar um feedback.</p>
              <button className="login-link" onClick={openAuthModal}>
                Fazer login ou cadastrar
              </button>
            </div>
          ) : submitted ? (
            <div className="feedback-submitted animate-fadeIn">
              <div className="success-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--highlight-color)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="thank-you-message">Seu feedback foi enviado com sucesso!</p>
              <p className="submitted-rating">
                <strong>Sua avaliação:</strong> {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
              </p>
              <p className="submitted-comment">
                <strong>Seu comentário:</strong> {comment}
              </p>
            </div>
          ) : (
            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="feedback-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= (hoverRating || rating) ? "filled" : ""}`}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                className="feedback-comment"
                placeholder="Escreva seu comentário (mínimo 10 caracteres, máximo 500)"
                value={comment}
                onChange={handleCommentChange}
                maxLength={500}
                required
              />
              <div className="instruction-message">
                O comentário deve ter no mínimo 10 caracteres.
              </div>
              <p className="char-count">{comment.length}/1000</p>
              {submissionError && (
                <div className="submission-error animate-slideUp">{submissionError}</div>
              )}
              <button
                type="submit"
                className="feedback-submit"
                disabled={rating === 0 || comment.trim().length < 10 || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar Feedback"
                )}
              </button>
            </form>
          )}
        </section>
      </div>
      {warning && <div className="feedback-warning animate-slideUp">{warning}</div>}
    </>
  );
};

export default Feedback;