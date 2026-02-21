import React, { useState, useEffect } from "react";
import "../styles/authmodal.css";

const API_URLS = {
  login: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/auth/login",
  register: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/cadastro",
  verify: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/ativar-conta", // Ajustado para bater com o Controller
  resend: "https://api-java-brunof-dkaqbfaheabebcbh.eastus-01.azurewebsites.net/usuario/reenviar-codigo",
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
  const [activeTab, setActiveTab] = useState("login"); // login, register, verify
  const [formData, setFormData] = useState({
    name: "", userName: "", password: "", email: "", code: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const isLogin = activeTab === "login";

  // VALIDAÇÕES VISUAIS
  const isNameValid = !isLogin && activeTab !== "verify" && formData.name &&
    formData.name.length >= 5 && formData.name.length <= 100 &&
    /^[A-Za-zÀ-ú\s'-]+$/.test(formData.name);

  const isUserNameValid = formData.userName &&
    (!isLogin ? true : formData.userName.length >= 5) && 
    (isLogin || (formData.userName.length <= 20 && /^\S+$/.test(formData.userName)));

  const isPasswordValid = formData.password &&
    (!isLogin ? true : formData.password.length >= 8) &&
    (isLogin || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password));

  const isEmailValid = (!isLogin && activeTab !== "verify") || !formData.email || (
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
    setFormData({ name: "", userName: "", password: "", email: "", code: "" });
    setError("");
    setSuccessMessage("");
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await fetchWithRetry(API_URLS.resend, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // Backend espera String simples
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
    if (activeTab === "verify") {
      if (formData.code.length !== 6) {
        setError("O código deve ter exatamente 6 dígitos.");
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
    if (formData.name.length < 5 || formData.name.length > 100) { setError("O nome deve ter entre 5 e 100 caracteres."); return false; }
    if (!/^[A-Za-zÀ-ú\s'-]+$/.test(formData.name)) { setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos."); return false; }
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
      let url = API_URLS[activeTab];
      let payload;

      // Monta o payload respeitando o contrato exato do seu Backend
      if (activeTab === "verify") {
        payload = { userName: formData.userName, codigo: formData.code };
      } else {
        payload = isLogin
          ? { cpf: formData.userName, senha: formData.password } // Mantido o envio como "cpf"
          : { nome: formData.name, email: formData.email || "", userName: formData.userName, senha: formData.password };
      }

      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('🔍 DEBUG API - Resposta completa:', data);

      if (!response.ok) {
        setError(data.erro?.message || data.message || "Erro na resposta da API.");
        setIsLoading(false);
        return;
      }

      // Tratamento baseado no status da resposta padrão da sua API
      if (data.status === true || response.status === 200) {
        
        // ==========================================
        // FLUXO DE VERIFICAÇÃO DE CONTA (Ativação)
        // ==========================================
        if (activeTab === "verify") {
          setSuccessMessage("Conta ativada com sucesso! Bem-vindo(a)!");
          setTimeout(() => {
            handleLoginSuccess({ 
              token: tempUser?.token || data.dados?.token, 
              user: data.dados.clienteDTO || data.dados 
            });
            onClose();
          }, 1500);
        } 
        
        // ==========================================
        // FLUXO DE LOGIN
        // ==========================================
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
        
        // ==========================================
        // FLUXO DE CADASTRO E AUTO-LOGIN
        // ==========================================
        else if (activeTab === "register") {
          // Auto-login silencioso usando a chave "cpf"
          try {
            const loginPayload = { cpf: formData.userName, senha: formData.password };
            const loginRes = await fetchWithRetry(API_URLS.login, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(loginPayload),
            });
            const loginData = await loginRes.json();
            if (loginRes.ok) {
              setTempUser(loginData.dados); 
            }
          } catch (autoLoginErr) {
            console.warn("Auto-login falhou, o usuário precisará fazer login manualmente após validar.");
          }

          setFormData((prev) => ({ ...prev, email: data.dados?.email || prev.email }));
          setActiveTab("verify");
          setSuccessMessage("Cadastro realizado! Enviamos um código para seu e-mail.");
        }
      }
    } catch (error) {
      console.error('❌ Erro na execução:', error);
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
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

        {activeTab !== "verify" && (
          <div className="tabs">
            <button className={`tab ${isLogin ? "active" : ""}`} onClick={() => handleTabChange("login")}>Login</button>
            <button className={`tab ${activeTab === "register" ? "active" : ""}`} onClick={() => handleTabChange("register")}>Cadastre-se</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{activeTab === "verify" ? "Validar E-mail" : isLogin ? "Entrar" : "Criar Conta"}</h2>
          {isLoading && <div className="loading-bar" />}

          {activeTab === "verify" ? (
            <div className="verify-view">
              <p className="instruction-message">Enviamos um código para <strong>{formData.email}</strong></p>
              <p className="expiry-warning">O código expira em 5 minutos.</p>
              <div className="form-group">
                <label>Código de 6 dígitos</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="000000" maxLength="6" required className="code-input" />
              </div>
              <button type="button" className="resend-button" disabled={resendTimer > 0} onClick={handleResendCode}>
                {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : "Reenviar Código"}
              </button>
            </div>
          ) : (
            <>
              {activeTab === "register" && (
                <div className="form-group">
                  <label>Nome</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className={formData.name && isNameValid ? "valid" : ""} />
                  <div className="instruction-message">Nome deve ter 5-100 caracteres, apenas letras, espaços, hífens ou apóstrofos.</div>
                </div>
              )}
              <div className="form-group">
                <label>Usuário</label>
                <input type="text" name="userName" value={formData.userName} onChange={handleChange} required className={formData.userName && isUserNameValid ? "valid" : ""} />
                {activeTab === "register" && <div className="instruction-message">Nome de usuário deve ter 5-20 caracteres, sem espaços.</div>}
              </div>
              <div className="form-group">
                <label>Senha</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required className={formData.password && isPasswordValid ? "valid" : ""} />
                {activeTab === "register" && <div className="instruction-message">Senha deve ter no mínimo 8 caracteres, com Maiúscula, Minúscula, Número e Especial.</div>}
              </div>
              {activeTab === "register" && (
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={formData.email && isEmailValid ? "valid" : ""} />
                  <div className="instruction-message">Email deve ser válido e sem espaços (obrigatório).</div>
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Processando..." : activeTab === "verify" ? "Confirmar" : isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;