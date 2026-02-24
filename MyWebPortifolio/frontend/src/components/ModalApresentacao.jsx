import "../styles/modalApresentacao.css";
import { useEffect, useState, useRef } from "react";

const ModalApresentacao = ({ onClose }) => {
    const [decolou, setDecolou] = useState(false);
    const fogueteRef = useRef(null);

    const handleClick = () => {
        if (!decolou) {
            setDecolou(true);
        }
    };

    useEffect(() => {
        const foguete = fogueteRef.current;
        if (foguete && decolou) {
            const handleAnimationEnd = () => {
                onClose();
            };
            foguete.addEventListener("animationend", handleAnimationEnd);
            return () => {
                foguete.removeEventListener("animationend", handleAnimationEnd);
            };
        }
    }, [decolou, onClose]);

    return (
        <div className="modal-wrapper">
            <h2 className="titulo-apresentacao">{'< Hello World />'}</h2>
            
            <div className="modal-apresentacao">
                {/* Texto dividido em parágrafos para leitura dinâmica */}
                <p className="par-boas-vindas">
                    Seja muito bem-vindo ao meu portfólio! Desde que comecei a programar, descobri que cada linha de código é uma oportunidade de <strong>transformar ideias em soluções reais e inovadoras</strong>.
                </p>
                <p className="par-boas-vindas">
                    Minha paixão pela tecnologia me impulsiona a enfrentar desafios complexos, unindo criatividade com a eficiência da engenharia de software. Aqui, você encontrará um reflexo da minha jornada: projetos que equilibram design, arquitetura e funcionalidade.
                </p>
                <p className="par-boas-vindas">
                    Convido você a explorar meu universo tecnológico. Vamos juntos transformar o futuro?
                </p>
            </div>

            {/* Foguete e Instrução */}
            <div className="foguete-container">
                <p className={`instrucao-foguete ${decolou ? "escondido" : ""}`}>
                    Clique no foguete para iniciar
                </p>
                <p
                    ref={fogueteRef}
                    className={`span-emoji-final ${decolou ? "decolando" : ""}`}
                    onClick={handleClick}
                    title="Decolar!"
                >
                    🚀
                </p>
            </div>
        </div>
    );
};

export default ModalApresentacao;