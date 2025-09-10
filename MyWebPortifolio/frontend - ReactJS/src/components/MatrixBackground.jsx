import React, { useEffect, useRef } from "react";
import "../styles/matrixBackground.css";

const MatrixBackground = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const fontSize = 16;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(0);

    const baseGreen = "#00ff00";
    const glowGreen = "#00ff88";
    const redColor = "#ff3333"; // cor das letras empurradas

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        let y = drops[i] * fontSize;

        const dx = mouse.current.x - x;
        const dy = mouse.current.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Letras próximas ao mouse são empurradas e ficam vermelhas
        if (dist < 150) {
          drops[i] = Math.max(drops[i] - Math.ceil((150 - dist) / 10), 0);
          ctx.fillStyle = redColor;
        } else {
          ctx.fillStyle = Math.random() > 0.3 ? baseGreen : glowGreen;
        }

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i] += 1 + Math.random() * 1.5;
      }
    };

    const interval = setInterval(draw, 35);

    const handleResize = () => {
      resizeCanvas();
      drops.length = Math.floor(canvas.width / fontSize);
      drops.fill(0);
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-background" />;
};

export default MatrixBackground;
