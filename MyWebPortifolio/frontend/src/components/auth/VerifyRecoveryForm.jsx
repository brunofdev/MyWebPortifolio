import React from "react";

const VerifyRecoveryForm = ({ formData, handleChange, maskedEmail }) => {
  return (
    <div className="verify-view">
      <p className="instruction-message">
        Enviamos um código de segurança para <strong>{maskedEmail || formData.userName}</strong>
      </p>
      <p className="expiry-warning">O código expira em 5 minutos.</p>
      <div className="form-group">
        <label>Código de 6 dígitos</label>
        <input 
          type="text" 
          name="code" 
          value={formData.code} 
          onChange={handleChange} 
          placeholder="000000" 
          maxLength="6" 
          required 
          className="code-input" 
        />
      </div>
      {/* O botão de reenviar pode ser omitido aqui para forçar o usuário a voltar e digitar novamente, 
          ou você pode reaproveitar a função resendTimer se quiser adicionar depois */}
    </div>
  );
};

export default VerifyRecoveryForm;