import React from "react";
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ formData, handleChange, isUserNameValid, isPasswordValid, handleTabChange, handleLoginSuccess, onClose }) => {

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential; // A ficha dourada!

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleToken: googleToken })
      });

      const data = await response.json();
      if (response.ok) {
        const userObj = data.dados.clienteDTO || data.dados.usuarioDTO || data.dados.usuario || data.dados;
          handleLoginSuccess({ token: data.dados.token, user: userObj });
      }
    } catch (error) {
      console.error("Erro na comunicação com a API", error);
    }
  };

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
      <div className="form-group">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log('Login Falhou')}
          theme="filled_black"
        />
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