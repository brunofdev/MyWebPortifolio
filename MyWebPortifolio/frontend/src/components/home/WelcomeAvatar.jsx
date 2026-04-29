import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import "../../styles/welcome-avatar.css";

const MESSAGES = [
  { text: "Ei, seja bem-vindo! 👋", delay: 3200 },
  { text: "Sou o Bruno — dev backend apaixonado por Java e Spring Boot.", delay: 3800 },
  { text: "Aqui você vai encontrar arquitetura limpa, APIs robustas e código que escala. 🏗️", delay: 4200 },
  { text: "Dica: explore a aba Skills para ver minha stack completa. ☕", delay: 3800 },
  { text: "Clean Code não é opcional. É responsabilidade. 🧹", delay: 3600 },
  { text: "Se quiser conversar sobre tech, é só me chamar no LinkedIn! 🚀", delay: 4000 },
];

const TypedText = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="wv-cursor">|</span>}
    </span>
  );
};

const AvatarSVG = ({ waving, blinking }) => (
  <svg
    className="wv-avatar-svg"
    viewBox="0 0 120 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Glow */}
    <defs>
      <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25"/>
        <stop offset="100%" stopColor="#4ade80" stopOpacity="0"/>
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Shadow */}
    <ellipse cx="60" cy="196" rx="28" ry="5" fill="rgba(0,0,0,0.3)"/>

    {/* Body */}
    <rect x="32" y="95" width="56" height="62" rx="10" fill="#1e293b" stroke="#4ade80" strokeWidth="1.5"/>

    {/* Hoodie pocket */}
    <rect x="44" y="120" width="32" height="22" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
    {/* Code symbol on pocket */}
    <text x="60" y="135" textAnchor="middle" fontSize="10" fill="#4ade80" fontFamily="monospace" filter="url(#glow)">{`</>`}</text>

    {/* Left arm (static) */}
    <rect x="14" y="96" width="18" height="44" rx="9" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
    {/* Left hand */}
    <circle cx="23" cy="146" r="8" fill="#fbbf24"/>

    {/* Right arm (waving) */}
    <g
      style={{
        transformOrigin: "88px 100px",
        transform: waving ? "rotate(-35deg)" : "rotate(0deg)",
        transition: "transform 0.15s ease",
      }}
    >
      <rect x="88" y="96" width="18" height="44" rx="9" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
      {/* Right hand waving */}
      <circle cx="97" cy="146" r="8" fill="#fbbf24"/>
      {/* Fingers hint */}
      <circle cx="91" cy="141" r="3.5" fill="#f59e0b"/>
      <circle cx="97" cy="139" r="3.5" fill="#f59e0b"/>
      <circle cx="103" cy="141" r="3.5" fill="#f59e0b"/>
    </g>

    {/* Legs */}
    <rect x="36" y="154" width="20" height="36" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5"/>
    <rect x="64" y="154" width="20" height="36" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5"/>
    {/* Shoes */}
    <ellipse cx="46" cy="190" rx="13" ry="6" fill="#1e293b" stroke="#4ade80" strokeWidth="1"/>
    <ellipse cx="74" cy="190" rx="13" ry="6" fill="#1e293b" stroke="#4ade80" strokeWidth="1"/>

    {/* Neck */}
    <rect x="50" y="82" width="20" height="16" rx="6" fill="#fbbf24"/>

    {/* Head */}
    <rect x="28" y="28" width="64" height="60" rx="22" fill="#fbbf24"/>
    {/* Hair */}
    <path d="M28 44 Q30 22 60 20 Q90 22 92 44 Q88 28 60 26 Q32 28 28 44Z" fill="#1e293b"/>

    {/* Eyes */}
    {blinking ? (
      <>
        <rect x="40" y="52" width="14" height="3" rx="1.5" fill="#1e293b"/>
        <rect x="66" y="52" width="14" height="3" rx="1.5" fill="#1e293b"/>
      </>
    ) : (
      <>
        <ellipse cx="47" cy="54" rx="7" ry="7" fill="white"/>
        <ellipse cx="47" cy="54" rx="4" ry="4" fill="#1e293b"/>
        <ellipse cx="49" cy="52" rx="1.5" ry="1.5" fill="white"/>
        <ellipse cx="73" cy="54" rx="7" ry="7" fill="white"/>
        <ellipse cx="73" cy="54" rx="4" ry="4" fill="#1e293b"/>
        <ellipse cx="75" cy="52" rx="1.5" ry="1.5" fill="white"/>
      </>
    )}

    {/* Eyebrows */}
    <path d="M40 46 Q47 43 54 46" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M66 46 Q73 43 80 46" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>

    {/* Smile */}
    <path d="M46 68 Q60 78 74 68" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

    {/* Headphones */}
    <path d="M28 50 Q28 26 60 26 Q92 26 92 50" stroke="#4ade80" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#glow)"/>
    <rect x="23" y="48" width="10" height="16" rx="5" fill="#4ade80" filter="url(#glow)"/>
    <rect x="87" y="48" width="10" height="16" rx="5" fill="#4ade80" filter="url(#glow)"/>

    {/* Neon collar */}
    <path d="M44 95 L60 108 L76 95" stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
  </svg>
);

const WelcomeAvatar = ({ allowClose = true }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [waving, setWaving] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [position, setPosition] = useState({ x: null, y: null });
  const [bubbleKey, setBubbleKey] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const timerRef = useRef(null);
  const wavingRef = useRef(null);
  const blinkRef = useRef(null);
  const containerRef = useRef(null);
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const close = useCallback(() => {
    clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  // Message sequencer
  useEffect(() => {
    if (minimized) return;
    clearTimeout(timerRef.current);
    setBubbleKey((k) => k + 1);

    const msg = MESSAGES[msgIndex];
    timerRef.current = setTimeout(() => {
      if (msgIndex < MESSAGES.length - 1) {
        setMsgIndex((i) => i + 1);
      } else {
        setTimeout(close, 1200);
      }
    }, msg.delay);

    return () => clearTimeout(timerRef.current);
  }, [msgIndex, minimized, close]);

  // Wave on mount and each new message
  useEffect(() => {
    setWaving(true);
    clearTimeout(wavingRef.current);
    wavingRef.current = setTimeout(() => setWaving(false), 1200);
  }, [msgIndex]);

  // Blink loop
  useEffect(() => {
    const doBlink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
      blinkRef.current = setTimeout(doBlink, 3200 + Math.random() * 2000);
    };
    blinkRef.current = setTimeout(doBlink, 1800);
    return () => clearTimeout(blinkRef.current);
  }, []);

  // Drag
  const onMouseDown = (e) => {
    if (e.target.closest("button")) return;
    const rect = containerRef.current.getBoundingClientRect();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };
  const onMouseUp = () => {
    dragRef.current.dragging = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  if (!visible) return null;

  const posStyle = position.x !== null
    ? { left: position.x, top: position.y, bottom: "auto", right: "auto" }
    : {};

  return createPortal(
    <div
      ref={containerRef}
      className={`wv-container ${minimized ? "wv-container--mini" : ""}`}
      style={posStyle}
      onMouseDown={onMouseDown}
    >
      {/* Close */}
      {allowClose && (
        <button className="wv-btn wv-btn--close" onClick={close} title="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {/* Minimize */}
      <button
        className="wv-btn wv-btn--mini"
        onClick={() => setMinimized((m) => !m)}
        title={minimized ? "Expandir" : "Minimizar"}
      >
        {minimized ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </button>

      {/* Bubble */}
      {!minimized && (
        <div className="wv-bubble-wrap" key={bubbleKey}>
          <div className="wv-bubble">
            <div className="wv-bubble-bar" />
            <p className="wv-bubble-text">
              <TypedText text={MESSAGES[msgIndex].text} />
            </p>
            <div className="wv-bubble-dots">
              {MESSAGES.map((_, i) => (
                <span key={i} className={`wv-dot ${i === msgIndex ? "wv-dot--active" : ""}`} />
              ))}
            </div>
          </div>
          <div className="wv-bubble-tail" />
        </div>
      )}

      {/* Avatar */}
      <div className={`wv-avatar-wrap ${minimized ? "wv-avatar-wrap--mini" : ""}`}>
        <div className="wv-avatar-glow" />
        <AvatarSVG waving={waving} blinking={blinking} />
        {minimized && (
          <span className="wv-mini-ping" />
        )}
      </div>
    </div>,
    document.body
  );
};

export default WelcomeAvatar;