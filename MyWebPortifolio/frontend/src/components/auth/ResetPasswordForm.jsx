import React, { useState } from "react";

const ResetPasswordForm = ({ formData, handleChange, isPasswordValid }) => {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const toggleSenha = () => setMostrarSenha(!mostrarSenha);
  const toggleConfirmacao = () => setMostrarConfirmacao(!mostrarConfirmacao);

  const showInvalid = formData.password.length > 0 && !isPasswordValid;
  const showValid = formData.password.length > 0 && isPasswordValid;

  const isConfirmValid = formData.confirmPassword && formData.confirmPassword === formData.password;
  const showConfirmInvalid = formData.confirmPassword?.length > 0 && !isConfirmValid;
  const showConfirmValid = formData.confirmPassword?.length > 0 && isConfirmValid;

  return (
    <div className="reset-password-view animate-fadeIn">
      
      <p className="input-helper-text" style={{ marginBottom: "20px", color: "#e0e0e0" }}>
        Quase lá! Agora crie uma nova senha de acesso segura.
      </p>

      {/* CAMPO 1: NOVA SENHA */}
      <div className="form-group">
        <label>Nova Senha</label>
        
        <div className="input-wrapper">
          <input 
            type={mostrarSenha ? "text" : "password"} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Digite sua nova senha"
            required 
            className={showValid ? "valid" : (showInvalid ? "invalid" : "")} 
          />
          {/* 🚨 OLHO MÁGICO DISCRETO COM SVG */}
          <button 
            type="button" 
            className="toggle-password-btn" 
            onClick={toggleSenha}
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? (
              // Ícone Olho Fechado (Discreto)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              // Ícone Olho Aberto (Discreto)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )} 
          </button>
        </div>
        <div className="form-group">
        <label>Confirmar Nova Senha</label>
        
        <div className="input-wrapper">
          <input 
            type={mostrarConfirmacao ? "text" : "password"} 
            name="confirmPassword" 
            value={formData.confirmPassword || ""} 
            onChange={handleChange} 
            placeholder="Digite a senha novamente"
            required 
            className={showConfirmValid ? "valid" : (showConfirmInvalid ? "invalid" : "")} 
          />
          {/* 🚨 OLHO MÁGICO DISCRETO COM SVG NA CONFIRMAÇÃO */}
          <button 
            type="button" 
            className="toggle-password-btn" 
            onClick={toggleConfirmacao}
            title={mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarConfirmacao ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )} 
          </button>
        </div>
        {showConfirmInvalid && (
          <p className="error-text">As senhas não coincidem.</p>
        )}
      </div>

        <div className="input-helper-text">
          <p>Sua senha deve conter no mínimo 8 caracteres, incluindo:</p>
          <ul style={{ margin: "6px 0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
            <li style={{ color: formData.password.match(/[A-Z]/) ? "#48bb78" : "inherit" }}>Letra maiúscula</li>
            <li style={{ color: formData.password.match(/[a-z]/) ? "#48bb78" : "inherit" }}>Letra minúscula</li>
            <li style={{ color: formData.password.match(/[0-9]/) ? "#48bb78" : "inherit" }}>Número</li>
            <li style={{ color: formData.password.match(/[@$!%*?&#]/) ? "#48bb78" : "inherit" }}>Caractere especial (ex: @, $, !, %, #)</li>
          </ul>
        </div>
      </div>

      {/* CAMPO 2: CONFIRMAÇÃO DA SENHA */}
      

    </div>
  );
};

export default ResetPasswordForm;