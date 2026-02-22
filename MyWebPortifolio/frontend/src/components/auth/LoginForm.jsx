import React from "react";

const LoginForm = ({ formData, handleChange, isUserNameValid, isPasswordValid, handleTabChange }) => {
  return (
    <>
      <div className="form-group">
        <label>Usuário</label>
        <input type="text" name="userName" value={formData.userName} onChange={handleChange} required className={formData.userName && isUserNameValid ? "valid" : ""} />
      </div>
      <div className="form-group">
        <label>Senha</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required className={formData.password && isPasswordValid ? "valid" : ""} />
      </div>
      
      {/* NOVO: Link de recuperação */}
      <div className="forgot-password-container">
        <button type="button" className="forgot-password-link" onClick={() => handleTabChange("forgot-password")}>
          Esqueceu sua SENHA ou NOME de USUARIO? Recupere aqui
        </button>
      </div>
    </>
  );
};

export default LoginForm;