import React from "react";

const ForgotPasswordForm = ({ formData, handleChange }) => {
  return (
    <div className="form-group">
      <p className="instruction-message" style={{ marginBottom: "16px" }}>
        Digite seu nome de usuário ou e-mail cadastrado. Enviaremos um código de 6 dígitos para você redefinir sua senha.
      </p>
      <label>Usuário ou E-mail</label>
      <input 
        type="text" 
        name="userName" 
        value={formData.userName} 
        onChange={handleChange} 
        required 
      />
    </div>
  );
};

export default ForgotPasswordForm;