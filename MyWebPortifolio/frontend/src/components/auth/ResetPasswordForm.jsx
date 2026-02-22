import React from "react";

const ResetPasswordForm = ({ formData, handleChange, isPasswordValid }) => {
  return (
    <div className="verify-view">
      <p className="instruction-message" style={{ marginBottom: "16px" }}>
        Código validado com sucesso! Crie sua nova senha abaixo.
      </p>
      <div className="form-group">
        <label>Nova Senha</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          className={formData.password && isPasswordValid ? "valid" : ""} 
        />
        <div className="instruction-message">
          A senha deve ter no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial (ex: @, $, !, %).
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;