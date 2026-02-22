import React from "react";

const VerifyForm = ({ formData, handleChange, resendTimer, handleResendCode }) => {
  return (
    <div className="verify-view">
      <p className="instruction-message">Enviamos um código para <strong>{formData.email}</strong></p>
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
      <button 
        type="button" 
        className="resend-button" 
        disabled={resendTimer > 0} 
        onClick={handleResendCode}
      >
        {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : "Reenviar Código"}
      </button>
    </div>
  );
};

export default VerifyForm;