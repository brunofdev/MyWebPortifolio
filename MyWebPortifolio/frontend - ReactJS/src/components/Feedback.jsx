import React, { useState, useEffect } from "react";
import "../styles/feedback.css";

const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [warning, setWarning] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState("");

   const badWords = {
  // Palavras relacionadas a atos ou partes do corpo
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
  // Novas adições
  bagos: "bolinhas",
  cabaço: "novato",
  caralha: "sorvetão", // Variação de caralho
  chana: "florzona", // Variação de buceta
  kacete: "biscoitão", // Variação de cacete
  mandioca: "cenourinha",
  pica: "gravetão",
  pintelho: "peninha",
  rabo: "caudinha",
  trepar: "dançar",
  xana: "borboletinha", // Variação de xoxota

  // Ofensas e xingamentos gerais
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
  // Novas adições
  baitola: "pessoa festiva",
  beócio: "sabichão",
  canalhice: "travessura",
  capadócio: "espertalhão",
  corno_manso: "sortudo tranquilo",
  cuzona: "docinho gigante", // Variação de cuzão
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
                `Ei! Palavras como "${foundBadWords.join(
                    ", "
                )}" foram trocadas por algo mais amigável 😉`
            );
        }

        return filteredText;
    };

    useEffect(() => {
        if (warning) {
            const timer = setTimeout(() => setWarning(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [warning]);

    const handleRating = (value) => setRating(value);

    const handleCommentChange = (e) => {
        if (e.target.value.length <= 1000) {
            const newValue = replaceBadWords(e.target.value);
            setComment(newValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating > 0 && comment.trim()) {
            setIsLoading(true);
            setSubmissionError("");

            const feedbackData = {
                userFeedback: comment,
                userRating: rating,
            };

            try {
                const response = await fetch('https://microservice-feedback.onrender.com/feedback/criar-feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(feedbackData),
                });

                if (response.ok) {
                    setSubmitted(true);
                } else {
                    setSubmissionError("Servidor indisponível, tente novamente mais tarde.");
                }
            } catch (error) {
                console.error("Erro de conexão:", error);
                setSubmissionError("Servidor indisponível, tente novamente mais tarde.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <>
            <div className="feedback-container">
                <section className="feedback">
                    <h2>Deixe seu Feedback</h2>
                    <h3>(Isso me ajuda a evoluir)</h3>

                    {submitted ? (
                        <div className="feedback-submitted animate-fadeIn">
                            <p className="thank-you-message">Seu feedback foi enviado com sucesso!</p>
                            <p className="submitted-rating">
                                <strong>Sua avaliação:</strong> {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                            </p>
                            <p className="submitted-comment">
                                <strong>Seu comentário:</strong> {comment}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
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
                                placeholder="Escreva seu comentário (máximo 1000 caracteres)"
                                value={comment}
                                onChange={handleCommentChange}
                                maxLength={1000}
                                required
                            />
                            <p className="char-count">{comment.length}/1000</p>
                            {submissionError && (
                                <div className="submission-error">
                                    {submissionError}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="feedback-submit"
                                disabled={rating === 0 || !comment.trim() || isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Feedback'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
            {warning && (
                <div className="feedback-warning">
                    {warning}
                </div>
            )}
        </>
    );
};

export default Feedback;
