import React from "react";
import "../../styles/authmodal.css";

const RegisterForm = ({ formData, handleChange, isNameValid, isUserNameValid, isPasswordValid, isEmailValid }) => {
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
        <label>Senha *</label>
        <div className="input-wrapper">
          <input 
            type="password" 
            name="password" 
            placeholder="Digite sua senha" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            aria-invalid={formData.password && !isPasswordValid ? "true" : "false"}
            className={formData.password ? (isPasswordValid ? "valid" : "invalid") : ""} 
          />
        </div>
        <div className="instruction-message">Senha deve ter no mínimo 8 caracteres, com pelo menos uma maiúscula, uma minúscula, um número e um caractere especial (@ $ ! % * ? & #).</div>
        {formData.password && !isPasswordValid && <div className="error-text">Senha inválida. Verifique os requisitos.</div>}
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
    </>
  );
};

export default RegisterForm;