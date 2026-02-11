import "../styles/modalApresentacao.css";
import { useEffect, useState, useRef } from "react";


const ModalApresentacao = ({ onClose }) => {
    const [decolou, setDecolou] = useState(false);
    const fogueteRef = useRef(null);

    const handleClick = () => {
        if (!decolou) {
            setDecolou(true);
            console.log("Foguete decolou!");
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
        <div className="modal-wrapper"> {/* Novo wrapper para agrupar tudo */}
            <h2 className="titulo-apresentacao">Seja Bem vindo (!) Welcome!</h2>
            <div className="modal-apresentacao">
                <p className="par-boas-vindas">
                    Este é meu portfólio! Desde que comecei a programar, descobri que cada linha de código é
                    uma oportunidade de transformar ideias em soluções reais e inovadoras. Minha paixão pela
                    tecnologia me impulsiona a enfrentar desafios e a buscar constantemente novas formas de 
                    unir criatividade com eficiência. Ao longo da minha trajetória, tive a chance de colaborar 
                    em projetos diversos, onde aprimorei minhas habilidades e aprendi a valorizar o equilíbrio 
                    entre design e funcionalidade. Este espaço reflete a minha jornada profissional e pessoal, 
                    reunindo projetos que demonstram meu compromisso com a qualidade e a inovação. Convido você
                    a explorar meu universo, conhecer os desafios superados e celebrar as conquistas que cada 
                    projeto representa. Vamos juntos transformar o futuro através da tecnologia!
    
                </p>
            </div>
            <p
                ref={fogueteRef}
                className={`span-emoji-final ${decolou ? "decolando" : ""}`}
                onClick={handleClick}
            >
                🚀
            </p>
        </div>
    );
};

export default ModalApresentacao;