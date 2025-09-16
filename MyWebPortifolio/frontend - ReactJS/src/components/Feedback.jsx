import React, { useState, useEffect } from "react";
import "../styles/feedback.css";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [warning, setWarning] = useState("");

  // Palavrões -> palavras amigáveis (mais de 50 exemplos)
  const badWords = {
    merda: "brigadeiro",
    bosta: "docinho",
    cocô: "florzinha",
    porra: "pipoca",
    caralho: "sorvete",
    carai: "caramba",
    cacete: "biscoito",
    foda: "sensacional",
    pqp: "uau",
    pequepe: "peixinho",
    lixo: "tesouro",
    idiota: "sábio",
    burro: "gênio",
    imbecil: "inteligente",
    retardado: "esperto",
    mongol: "atleta",
    jumento: "mestre",
    asno: "líder",
    otário: "campeão",
    trouxa: "ingênuo",
    babaca: "herói",
    mané: "guerreiro",
    zé_ruela: "camarada",
    tonto: "desatento",
    cretino: "bobalhão",
    fanfarrão: "engraçadinho",
    palhaço: "artista",
    canalha: "travesso",
    safado: "malandro",
    puta: "estrela",
    putaria: "festa",
    vadia: "amiga",
    vagabundo: "trabalhador",
    desgraça: "alegria",
    nojento: "diferente",
    ridículo: "divertido",
    esquisito: "único",
    maldito: "levado",
    palhaçada: "brincadeira",
    bunda: "popozão",
    corno: "sortudo",
    chifrudo: "desprevenido",
    piolho: "pequenino",
    cabrão: "carinha",
    carneiro: "ovelhinha",
    nego: "luz",
    ladrão: "iluminado",
    burrice: "desafio",
    chato: "curioso",
    fracassado: "vencedor",
    droga: "puxa vida",
  };

  // Normaliza texto: remove espaços, repetições e maiúsculas
  const normalizeText = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/(.)\1+/g, "$1");

  // Substitui palavrões e dispara aviso
  const replaceBadWords = (text) => {
    let filteredText = text;
    const foundBadWords = [];

    const normalizedText = normalizeText(text);

    Object.keys(badWords).forEach((badWord) => {
      const regex = new RegExp(`\\b${badWord}\\b`, "gi");
      if (regex.test(normalizedText)) {
        foundBadWords.push(badWord.toUpperCase());
      }
      filteredText = filteredText.replace(regex, badWords[badWord]);
    });

    if (foundBadWords.length > 0) {
      setWarning(
        `Ei! Palavras como "${foundBadWords.join(
          ", "
        )}" foram trocadas por algo mais amigável 😉`
      );
    }

    return filteredText;
  };

  // Aviso desaparece em 3 segundos
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0 && comment.trim()) {
      setSubmitted(true);
      // enviar para backend aqui
    }
  };

  return (
    <section className="feedback bg-[#181818] p-6 rounded-xl border-2 border-[#4caf50] shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
        Deixe seu Feedback ou críticas construtivas por gentileza
      </h2>
      <h3 className="text-lg text-[#bbb] text-center mb-6">(Isso me ajuda a evoluir)</h3>

      {warning && (
        <div className="feedback-warning bg-[#222] text-[#f50505] p-3 rounded-lg text-center animate-fadeIn">
          {warning}
        </div>
      )}

      {submitted ? (
        <div className="feedback-submitted bg-[#222] p-6 rounded-lg text-center animate-fadeIn">
          <p className="text-lg sm:text-xl text-[#4caf50] mb-2">
            Obrigado pelo seu feedback!
          </p>
          <p className="text-white">
            <strong>Seu comentário:</strong> {comment}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="feedback-stars flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star text-2xl sm:text-3xl cursor-pointer transition-all duration-200 ${
                  star <= (hoverRating || rating) ? "text-[#f50505]" : "text-[#585a58]"
                }`}
                onClick={() => handleRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="feedback-comment w-full min-h-[120px] bg-[#222] text-white p-3 rounded-lg border border-[#4caf50] focus:outline-none focus:border-[#f50505] focus:shadow-glow transition-all duration-200 resize-vertical"
            placeholder="Escreva seu comentário (máximo 1000 caracteres)"
            value={comment}
            onChange={handleCommentChange}
            maxLength={1000}
          />
          <p className="char-count text-sm text-[#bbb] text-right mt-2 mb-4">
            {comment.length}/1000 caracteres
          </p>
          <button
            type="submit"
            className="feedback-submit w-full bg-gradient-to-r from-[#4caf50] to-[#4caf50] text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:from-[#f50505] hover:to-[#f50505] hover:shadow-glow disabled:bg-[#585a58] disabled:cursor-not-allowed"
            disabled={rating === 0 || !comment.trim()}
          >
            Enviar Feedback
          </button>
        </form>
      )}
    </section>
  );
};

export default Feedback;
