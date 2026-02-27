import React, { useState } from "react";
import "../../styles/authmodal.css";

const RegisterForm = ({ formData, handleChange, isNameValid, isUserNameValid, isPasswordValid, isEmailValid }) => {
  // Estados para os olhos mágicos
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const toggleSenha = () => setMostrarSenha(!mostrarSenha);
  const toggleConfirmacao = () => setMostrarConfirmacao(!mostrarConfirmacao);

  // Validações visuais locais para as confirmações
  const isConfirmEmailValid = formData.confirmEmail && formData.confirmEmail === formData.email;
  const showConfirmEmailInvalid = formData.confirmEmail?.length > 0 && !isConfirmEmailValid;

  const isConfirmPasswordValid = formData.confirmPassword && formData.confirmPassword === formData.password;
  const showConfirmPasswordInvalid = formData.confirmPassword?.length > 0 && !isConfirmPasswordValid;

  // Constantes de SVG para o Olho Mágico (para manter o código limpo)
  const eyeIconOpen = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const eyeIconClosed = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <>
      <div className="form-group">
        <label>Nome *</label>
        <div className="input-wrapper">
          <input 
            type="text" 
            name="name" 
            placeholder="Digite seu nome completo" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            aria-invalid={formData.name && !isNameValid ? "true" : "false"}
            className={formData.name ? (isNameValid ? "valid" : "invalid") : ""} 
          />
        </div>
        <div className="instruction-message">Nome deve ter 5-100 caracteres, apenas letras, espaços, hífens ou apóstrofos.</div>
        {formData.name && !isNameValid && <div className="error-text">Nome inválido. Verifique os requisitos.</div>}
      </div>

      <div className="form-group">
        <label>Nome Público</label>
        <div className="input-wrapper">
          <input 
            type="text" 
            name="nomePublico" 
            placeholder="Digite seu nome público (opcional)" 
            value={formData.nomePublico} 
            onChange={handleChange} 
            className={formData.nomePublico ? (isNameValid ? "valid" : "invalid") : ""} 
          />
        </div>
        <div className="instruction-message">Nome público será utilizado para identificação em perfis e interações.<br />Se não for preenchido, será definido como "usuario".</div>
      </div>
      
      <div className="form-group">
        <label>Usuário *</label>
        <div className="input-wrapper">
          <input 
            type="text" 
            name="userName" 
            placeholder="Digite seu nome de usuário" 
            value={formData.userName} 
            onChange={handleChange} 
            required 
            aria-invalid={formData.userName && !isUserNameValid ? "true" : "false"}
            className={formData.userName ? (isUserNameValid ? "valid" : "invalid") : ""} 
          />
        </div>
        <div className="instruction-message">Nome de usuário deve ter 5-20 caracteres, sem espaços.</div>
        {formData.userName && !isUserNameValid && <div className="error-text">Nome de usuário inválido. Verifique os requisitos.</div>}
      </div>
      
      <div className="form-group">
        <label>Email *</label>
        <div className="input-wrapper">
          <input 
            type="email" 
            name="email" 
            placeholder="Digite seu email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            aria-invalid={formData.email && !isEmailValid ? "true" : "false"}
            className={formData.email ? (isEmailValid ? "valid" : "invalid") : ""} 
          />
        </div>
        <div className="instruction-message">Email deve ser válido e sem espaços (obrigatório).</div>
        {formData.email && !isEmailValid && <div className="error-text">Email inválido. Verifique o formato.</div>}
      </div>

      {/* CAMPO: CONFIRMAÇÃO DE EMAIL */}
      <div className="form-group">
        <label>Confirmar Email *</label>
        <div className="input-wrapper">
          <input 
            type="email" 
            name="confirmEmail" 
            placeholder="Digite seu email novamente" 
            value={formData.confirmEmail || ""} 
            onChange={handleChange} 
            required 
            className={formData.confirmEmail?.length > 0 ? (isConfirmEmailValid ? "valid" : "invalid") : ""} 
          />
        </div>
        {showConfirmEmailInvalid && <div className="error-text">Os endereços de e-mail não coincidem.</div>}
      </div>

      <div className="form-group">
        <label>Senha *</label>
        <div className="input-wrapper">
          <input 
            type={mostrarSenha ? "text" : "password"} 
            name="password" 
            placeholder="Digite sua senha" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            aria-invalid={formData.password && !isPasswordValid ? "true" : "false"}
            className={formData.password ? (isPasswordValid ? "valid" : "invalid") : ""} 
          />
          {/* 🚨 OLHO MÁGICO SVG */}
          <button 
            type="button" 
            className="toggle-password-btn" 
            onClick={toggleSenha}
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? eyeIconClosed : eyeIconOpen} 
          </button>
        </div>
        <div className="instruction-message">Senha deve ter no mínimo 8 caracteres, com pelo menos uma maiúscula, uma minúscula, um número e um caractere especial (@ $ ! % * ? & #).</div>
        {formData.password && !isPasswordValid && <div className="error-text">Senha inválida. Verifique os requisitos.</div>}
      </div>

      {/* CAMPO: CONFIRMAÇÃO DE SENHA */}
      <div className="form-group">
        <label>Confirmar Senha *</label>
        <div className="input-wrapper">
          <input 
            type={mostrarConfirmacao ? "text" : "password"} 
            name="confirmPassword" 
            placeholder="Digite sua senha novamente" 
            value={formData.confirmPassword || ""} 
            onChange={handleChange} 
            required 
            className={formData.confirmPassword?.length > 0 ? (isConfirmPasswordValid ? "valid" : "invalid") : ""} 
          />
          {/* 🚨 OLHO MÁGICO SVG */}
          <button 
            type="button" 
            className="toggle-password-btn" 
            onClick={toggleConfirmacao}
            title={mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarConfirmacao ? eyeIconClosed : eyeIconOpen} 
          </button>
        </div>
        {showConfirmPasswordInvalid && <div className="error-text">As senhas não coincidem.</div>}
      </div>
    </>
  );
};

export default RegisterForm;