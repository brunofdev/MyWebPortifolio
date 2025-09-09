import React, { useEffect, useRef } from "react";
import "../styles/MatrixBackground.css"


const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Configura o tamanho do canvas para cobrir a janela
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Configurações do efeito Matrix
    const fontSize = 14;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0); // Posição inicial de cada coluna

    // Cores consistentes com o tema da aplicação
    const baseGreen = "#4caf50";
    const glowGreen = "#00ff88";

    // Função para desenhar o efeito
    const draw = () => {
      // Adiciona um fundo semi-transparente para efeito de fade
      ctx.fillStyle = "rgba(8, 8, 8, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      // Loop por cada coluna
      for (let i = 0; i < drops.length; i++) {
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Alterna entre cores para efeito de brilho
        ctx.fillStyle = Math.random() > 0.5 ? baseGreen : glowGreen;
        ctx.fillText(char, x, y);

        // Reseta a coluna ao chegar ao fim da tela
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    // Inicia a animação
    const interval = setInterval(draw, 50);

    // Ajusta o canvas ao redimensionar a janela
    const handleResize = () => {
      resizeCanvas();
      drops.length = Math.floor(canvas.width / fontSize);
      drops.fill(0);
    };
    window.addEventListener("resize", handleResize);

    // Limpeza ao desmontar o componente
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-background" />;
};

export default MatrixBackground;