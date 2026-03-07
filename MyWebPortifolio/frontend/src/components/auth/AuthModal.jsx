import React, { useState, useEffect } from "react";
import "../../styles/authmodal.css";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import VerifyForm from "./VerifyForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import VerifyRecoveryForm from "./VerifyRecoveryForm";
import ResetPasswordForm from "./ResetPasswordForm";

const BASE_URL = import.meta.env.VITE_API_URL || "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net";

const API_URLS = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/usuario/cadastro`,
  verify: `${BASE_URL}/usuario/ativar-conta`,
  resend: `${BASE_URL}/usuario/reenviar-codigo`,
  "forgot-password": `${BASE_URL}/usuario/senha/recuperacao`,
  "verify-recovery": `${BASE_URL}/usuario/senha/recuperacao/validar-codigo`,
  "reset-password": `${BASE_URL}/usuario/senha/recuperacao/alterar-senha`,
};

// ==========================================
// UTILS
// ==========================================
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

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const AuthModal = ({ handleLoginSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  
  // 🚨 ADICIONADOS: confirmPassword e confirmEmail no estado inicial
  const [formData, setFormData] = useState({
    name: "", nomePublico: "", userName: "", password: "", confirmPassword: "", email: "", confirmEmail: "", code: ""
  });
  
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [maskedEmail, setMaskedEmail] = useState("");

  const isLogin = activeTab === "login";

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const isValidName = () => {
    return formData.name && formData.name.length >= 5 && formData.name.length <= 100 && /^[A-Za-zÀ-ú\s'-]+$/.test(formData.name);
  };

  const isValidUserName = () => {
    if (!formData.userName) return false;
    if (activeTab !== "register") return true;
    return formData.userName.length >= 5 && formData.userName.length <= 20 && /^\S+$/.test(formData.userName);
  };

  const isValidPassword = () => {
    if (!formData.password) return false;
    if (activeTab !== "register" && activeTab !== "reset-password") return true;
    return formData.password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(formData.password);
  };

  const isValidEmail = () => {
    if (activeTab !== "register" || !formData.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && /^\S+$/.test(formData.email);
  };

  const isNameValid = !isLogin && activeTab === "register" && isValidName();
  const isUserNameValid = isValidUserName();
  const isPasswordValid = isValidPassword();
  const isEmailValid = isValidEmail();

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
      setFormData({ name: "", nomePublico: "", userName: "", password: "", confirmPassword: "", email: "", confirmEmail: "", code: "" });
      setMaskedEmail("");
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

  const getRequestPayload = () => {
    switch (activeTab) {
      case "login":
        return { userName: formData.userName, senha: formData.password };
      case "register":
        return {
          nome: formData.name,
          email: formData.email || "",
          userName: formData.userName,
          senha: formData.password,
          nomePublico: formData.nomePublico ? formData.nomePublico.trim() : null 
        };
      case "verify":
      case "verify-recovery":
        return { userName: formData.userName, codigo: formData.code };
      case "forgot-password":
        return formData.userName; 
      case "reset-password":
        return { userName: formData.userName, codigoVerificado: formData.code, novaSenha: formData.password };
      default:
        return {};
    }
  };

  const handleSuccessResponse = (data) => {
    switch (activeTab) {
      case "forgot-password":
        if (data?.dados?.email) setMaskedEmail(data.dados.email);
        setActiveTab("verify-recovery");
        setSuccessMessage("Código de recuperação enviado!");
        break;
      case "verify-recovery":
        setActiveTab("reset-password");
        setSuccessMessage("Código validado! Escolha sua nova senha.");
        break;
      case "reset-password":
        setFormData({ name: "", nomePublico: "", userName: "", password: "", confirmPassword: "", email: "", confirmEmail: "", code: "" });
        setActiveTab("login");
        setSuccessMessage("Senha alterada com sucesso! Faça login.");
        break;
      case "register":
        setFormData((prev) => ({ ...prev, email: data?.dados?.email || prev.email }));
        setActiveTab("verify");
        setSuccessMessage("Cadastro realizado! Enviamos um código para seu e-mail.");
        break;
      case "verify":
        setSuccessMessage("Conta ativada com sucesso! Bem-vindo(a)!");
        setTimeout(() => {
          const userObj = data.dados.clienteDTO || data.dados.usuarioDTO || data.dados.usuario || data.dados;
          handleLoginSuccess({ token: data.dados.token, user: userObj });
          onClose();
        }, 1500);
        break;
      case "login":
        const loginUserObj = data.dados.clienteDTO || data.dados.usuarioDTO || data.dados.usuario || data.dados;
        if (loginUserObj.contaAtiva === false) {
          setActiveTab("verify");
          setSuccessMessage("Sua conta não está ativa. Enviamos um novo código para o seu e-mail.");
        } else {
          handleLoginSuccess({ token: data.dados.token, user: loginUserObj });
          onClose();
        }
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🎯 ÂNCORA SUAVE PARA CAMPOS INVÁLIDOS
    const form = e.target;
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
      }
      return;
    }

    // 🛡️ VALIDAÇÃO DE DIGITAÇÃO DUPLA (ANTES DE CHAMAR A API)
    if (activeTab === "register") {
      if (formData.email !== formData.confirmEmail) {
        setError("Os endereços de e-mail não coincidem.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    } else if (activeTab === "reset-password") {
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const url = API_URLS[activeTab]; 
      const payload = getRequestPayload();
      const isPlainText = activeTab === "forgot-password";
      const headers = { "Content-Type": isPlainText ? "text/plain" : "application/json" };
      const body = isPlainText ? payload : JSON.stringify(payload);

      const response = await fetchWithRetry(url, { method: "POST", headers, body });

      let data = {};
      if (response.status !== 204) {
        try { data = await response.json(); } catch (err) { }
      }

      if (!response.ok) {
        setError(data.erro?.message || data.message || "Erro na solicitação.");
        return;
      }

      handleSuccessResponse(data);

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

        {/* 🚨 ADICIONADO: noValidate para o react assumir o controle do scroll */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <h2>{getTitle()}</h2>
          {isLoading && <div className="loading-bar" />}

          {/* 👇 CORPO ROLÁVEL (SÓ OS INPUTS) */}
          <div className="form-scrollable-body">
            {activeTab === "verify" && <VerifyForm formData={formData} handleChange={handleChange} resendTimer={resendTimer} handleResendCode={handleResendCode} />}
            {activeTab === "verify-recovery" && <VerifyRecoveryForm formData={formData} handleChange={handleChange} maskedEmail={maskedEmail} />}
            {activeTab === "login" && <LoginForm formData={formData} handleChange={handleChange} isUserNameValid={isUserNameValid} isPasswordValid={isPasswordValid} handleTabChange={handleTabChange} handleLoginSuccess={handleLoginSuccess} onClose={onClose} />}
            {activeTab === "register" && <RegisterForm formData={formData} handleChange={handleChange} isNameValid={isNameValid} isUserNameValid={isUserNameValid} isPasswordValid={isPasswordValid} isEmailValid={isEmailValid} />}
            {activeTab === "forgot-password" && <ForgotPasswordForm formData={formData} handleChange={handleChange} />}
            {activeTab === "reset-password" && <ResetPasswordForm formData={formData} handleChange={handleChange} isPasswordValid={isPasswordValid} />}
          </div>

          {/* 👇 RODAPÉ FIXO (MENSAGENS E BOTÕES) */}
          <div className="form-fixed-footer">
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? "Processando..." : (activeTab === "verify" || activeTab === "verify-recovery") ? "Confirmar" : activeTab === "forgot-password" ? "Enviar Código" : activeTab === "reset-password" ? "Salvar Senha" : isLogin ? "Entrar" : "Cadastrar"}
              </button>

              {["forgot-password", "verify-recovery", "reset-password"].includes(activeTab) && (
                <button type="button" className="cancel-button" onClick={() => handleTabChange("login")} disabled={isLoading}>
                  Cancelar / Voltar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;