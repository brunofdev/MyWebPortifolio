import React, { useState, useEffect } from "react";
import "../../styles/authmodal.css"; 
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import VerifyForm from "./VerifyForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import VerifyRecoveryForm from "./VerifyRecoveryForm";
import ResetPasswordForm from "./ResetPasswordForm";

const API_URLS = {
  login: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/auth/login",
  register: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/cadastro",
  verify: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/ativar-conta",
  resend: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/reenviar-codigo",
  
  forgotPassword: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/senha/recuperacao",
  verifyRecovery: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/senha/recuperacao/validar-codigo",
  resetPassword: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/senha/recuperacao/alterar-senha",
};

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && response.status <= 502 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Número máximo de tentativas excedido.");
};

const AuthModal = ({ handleLoginSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState("login"); 
  const [formData, setFormData] = useState({
    name: "", userName: "", password: "", email: "", code: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [tempUser, setTempUser] = useState(null);
  
  // Estado para armazenar o email ofuscado retornado pela API
  const [maskedEmail, setMaskedEmail] = useState(""); 

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const isLogin = activeTab === "login";

  // VALIDAÇÕES VISUAIS
  const isNameValid = !isLogin && activeTab === "register" && formData.name &&
    formData.name.length >= 5 && formData.name.length <= 100 &&
    /^[A-Za-zÀ-ú\s'-]+$/.test(formData.name);

  const isUserNameValid = formData.userName &&
    (activeTab !== "register" ? true : formData.userName.length >= 5) && 
    (activeTab !== "register" || (formData.userName.length <= 20 && /^\S+$/.test(formData.userName)));

  const isPasswordValid = formData.password &&
    (activeTab !== "register" && activeTab !== "reset-password" ? true : formData.password.length >= 8) &&
    (activeTab !== "register" && activeTab !== "reset-password" || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password));

  const isEmailValid = (activeTab !== "register") || !formData.email || (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && /^\S+$/.test(formData.email)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === "register") {
      if (name === "name" && value && !/^[A-Za-zÀ-ú\s'-]*$/.test(value)) {
        setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos.");
        return;
      }
      if (name === "userName" && value && !/^\S*$/.test(value)) {
        setError("O nome de usuário não pode conter espaços em branco.");
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "login" || tab === "register") {
      setFormData({ name: "", userName: "", password: "", email: "", code: "" });
      setMaskedEmail(""); // Limpa o email mascarado ao sair do fluxo de recuperação
    }
    setError("");
    setSuccessMessage("");
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await fetchWithRetry(API_URLS.resend, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: formData.userName,
      });
      setResendTimer(60);
      setSuccessMessage("Novo código enviado para seu e-mail!");
    } catch (err) {
      setError("Erro ao solicitar novo código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (activeTab === "verify" || activeTab === "verify-recovery") {
      if (formData.code.length !== 6) {
        setError("O código deve ter exatamente 6 dígitos.");
        return false;
      }
      return true;
    }
    
    if (activeTab === "forgot-password") {
      if (!formData.userName) { setError("Informe o usuário ou e-mail para recuperar a senha."); return false; }
      return true;
    }

    if (activeTab === "reset-password") {
      if (formData.password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
        setError("A senha não atende aos requisitos de segurança.");
        return false;
      }
      return true;
    }

    if (!formData.userName || !formData.password) {
      setError("Nome de usuário (CPF) e senha são obrigatórios.");
      return false;
    }
    if (isLogin) return true;

    if (!formData.name) { setError("O nome não pode estar em branco."); return false; }
    if (formData.userName.length < 5 || formData.userName.length > 20) { setError("O nome de usuário deve ter entre 5 e 20 caracteres."); return false; }
    if (!/^\S+$/.test(formData.userName)) { setError("O nome de usuário não pode conter espaços em branco."); return false; }
    if (formData.password.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return false; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      setError("A senha não atende aos requisitos de segurança.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      let url;
      let payload;

      if (activeTab === "login") {
        url = API_URLS.login;
        payload = { cpf: formData.userName, senha: formData.password };
      } else if (activeTab === "register") {
        url = API_URLS.register;
        payload = { nome: formData.name, email: formData.email || "", userName: formData.userName, senha: formData.password };
      } else if (activeTab === "verify") {
        url = API_URLS.verify;
        payload = { userName: formData.userName, codigo: formData.code };
      } else if (activeTab === "forgot-password") {
        url = API_URLS.forgotPassword;
        payload = formData.userName; 
      } else if (activeTab === "verify-recovery") {
        url = API_URLS.verifyRecovery;
        payload = { userName: formData.userName, codigo: formData.code };
      } else if (activeTab === "reset-password") {
        url = API_URLS.resetPassword;
        payload = { userName: formData.userName, codigoVerificado: formData.code, novaSenha: formData.password };
      }

      const isPlainText = activeTab === "forgot-password";
      const headers = { "Content-Type": isPlainText ? "text/plain" : "application/json" };
      const body = isPlainText ? payload : JSON.stringify(payload);

      const response = await fetchWithRetry(url, { method: "POST", headers, body });
      
      let data = {};
      // Só tenta ler o JSON se a resposta não for 204 No Content
      if (response.status !== 204) {
          try { data = await response.json(); } catch(err) {}
      }
      
      if (!response.ok) {
        setError(data.erro?.message || data.message || "Erro na solicitação.");
        setIsLoading(false);
        return;
      }

      // TRATAMENTO DE SUCESSO POR ABA
      if (activeTab === "forgot-password") {
        // Salva o e-mail retornado pela API para mostrar na próxima tela
        if (data.dados && data.dados.email) setMaskedEmail(data.dados.email);
        setActiveTab("verify-recovery");
        setSuccessMessage("Código de recuperação enviado!");
      } 
      else if (activeTab === "verify-recovery") {
        setActiveTab("reset-password");
        setSuccessMessage("Código validado! Escolha sua nova senha.");
      }
      else if (activeTab === "reset-password") {
        setFormData({ name: "", userName: "", password: "", email: "", code: "" });
        setActiveTab("login");
        setSuccessMessage("Senha alterada com sucesso! Faça login.");
      }
      else if (activeTab === "verify") {
        setSuccessMessage("Conta ativada com sucesso! Bem-vindo(a)!");
        setTimeout(() => {
          handleLoginSuccess({ token: tempUser?.token || data.dados?.token, user: data.dados.clienteDTO || data.dados });
          onClose();
        }, 1500);
      } 
      else if (activeTab === "login") {
        const user = data.dados.clienteDTO || data.dados.usuarioDTO || data.dados;
        if (user.contaAtiva === false) {
          setTempUser(data.dados); 
          setActiveTab("verify");
          setSuccessMessage("Sua conta não está ativa. Verifique seu e-mail.");
        } else {
          handleLoginSuccess({ token: data.dados.token, user });
          onClose();
        }
      } 
      else if (activeTab === "register") {
        try {
          const loginPayload = { cpf: formData.userName, senha: formData.password };
          const loginRes = await fetchWithRetry(API_URLS.login, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginPayload),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) { setTempUser(loginData.dados); }
        } catch (err) {}
        setFormData((prev) => ({ ...prev, email: data.dados?.email || prev.email }));
        setActiveTab("verify");
        setSuccessMessage("Cadastro realizado! Enviamos um código para seu e-mail.");
      }

    } catch (error) {
      console.error('❌ Erro na execução:', error);
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case "verify": return "Validar E-mail";
      case "forgot-password": return "Recuperar Senha";
      case "verify-recovery": return "Validar Código";
      case "reset-password": return "Nova Senha";
      case "register": return "Criar Conta";
      default: return "Entrar";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {(activeTab === "login" || activeTab === "register") && (
          <div className="tabs">
            <button className={`tab ${isLogin ? "active" : ""}`} onClick={() => handleTabChange("login")}>Login</button>
            <button className={`tab ${activeTab === "register" ? "active" : ""}`} onClick={() => handleTabChange("register")}>Cadastre-se</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{getTitle()}</h2>
          {isLoading && <div className="loading-bar" />}

          {/* RENDERIZAÇÃO CONDICIONAL DOS COMPONENTES */}
          {activeTab === "verify" && <VerifyForm formData={formData} handleChange={handleChange} resendTimer={resendTimer} handleResendCode={handleResendCode} />}
          {activeTab === "verify-recovery" && <VerifyRecoveryForm formData={formData} handleChange={handleChange} maskedEmail={maskedEmail} />}
          {activeTab === "login" && <LoginForm formData={formData} handleChange={handleChange} isUserNameValid={isUserNameValid} isPasswordValid={isPasswordValid} handleTabChange={handleTabChange} />}
          {activeTab === "register" && <RegisterForm formData={formData} handleChange={handleChange} isNameValid={isNameValid} isUserNameValid={isUserNameValid} isPasswordValid={isPasswordValid} isEmailValid={isEmailValid} />}
          {activeTab === "forgot-password" && <ForgotPasswordForm formData={formData} handleChange={handleChange} />}
          {activeTab === "reset-password" && <ResetPasswordForm formData={formData} handleChange={handleChange} isPasswordValid={isPasswordValid} />}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? "Processando..." : (activeTab === "verify" || activeTab === "verify-recovery") ? "Confirmar" : activeTab === "forgot-password" ? "Enviar Código" : activeTab === "reset-password" ? "Salvar Senha" : isLogin ? "Entrar" : "Cadastrar"}
            </button>
            
            {(activeTab === "forgot-password" || activeTab === "verify-recovery" || activeTab === "reset-password") && (
              <button type="button" className="cancel-button" onClick={() => handleTabChange("login")} disabled={isLoading}>
                Cancelar / Voltar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;