import React, { useState } from "react";
import "../styles/authmodal.css";

// Definindo as URLs da API em um só lugar para fácil manutenção
const API_URLS = {
  login: "https://apigateway-qao8.onrender.com/api/auth/login",
  register: "https://apigateway-qao8.onrender.com/api/users/register",
};

const AuthModal = ({ handleLoginSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState("login"); // 'login' ou 'register'
  
  // Estado único para ambos os formulários
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    password: "",
    email: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lida com a mudança em qualquer campo de input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Lida com a mudança de aba, limpando os erros
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    // Limpa o formulário ao trocar de aba para não manter dados antigos
    setFormData({ name: "", userName: "", password: "", email: "" });
  };

  // Validação de entrada
  const validateForm = (isLogin) => {
    if (!formData.userName || !formData.password) {
      setError("Nome de usuário e senha são obrigatórios.");
      return false;
    }
    if (formData.password.length < 5 || formData.password.length > 20) {
      setError("A senha deve ter entre 5 e 20 caracteres.");
      return false;
    }
    if (!isLogin && !formData.name) {
      setError("O nome é obrigatório para o cadastro.");
      return false;
    }
    return true;
  };

  // Função única de submissão para login e registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpa erros anteriores
    setIsLoading(true);

    const isLogin = activeTab === "login";

    // Valida os campos antes de enviar
    if (!validateForm(isLogin)) {
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = isLogin ? API_URLS.login : API_URLS.register;
      
      const bodyPayload = isLogin
        ? { userName: formData.userName, password: formData.password }
        : { name: formData.name, userName: formData.userName, password: formData.password, email: formData.email };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      // Trata erros
      if (!response.ok) {
        if (response.status === 500 || response.status === 502 || response.status === 503) {
          throw new Error("Servidor indisponível, tente novamente mais tarde.");
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error("Credenciais inválidas, tente novamente.");
        }

        if (response.status === 400) {
          const errorData = await response.json();
          const validationErrors = errorData.messages ? Object.values(errorData.messages).join(' ') : 'Dados inválidos.';
          throw new Error(validationErrors);
        }

        throw new Error("Ocorreu um erro desconhecido.");
      }

      // Para login, espera um JSON com o token
      if (isLogin) {
        const data = await response.json();
        handleLoginSuccess({ token: data.token }); // Passa o token para o componente pai
      } 
      // Para registro, status 201 com body vazio
      else if (response.status === 201) {
        alert('Cadastro realizado com sucesso! Por favor, faça o login.');
        handleTabChange('login');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <button className="close-button" onClick={onClose} aria-label="Fechar modal">
        ✕
      </button>
      <div className="tabs">
        <button
          className={`tab ${activeTab === "login" ? "active" : ""}`}
          onClick={() => handleTabChange("login")}
        >
          Login
        </button>
        <button
          className={`tab ${activeTab === "register" ? "active" : ""}`}
          onClick={() => handleTabChange("register")}
        >
          Cadastre-se
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{activeTab === "login" ? "Login" : "Cadastre-se"}</h2>

        {/* Campo de Nome (apenas para cadastro) */}
        {activeTab === "register" && (
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Campos Comuns */}
        <div className="form-group">
          <label htmlFor="userName">Username</label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={5}
            maxLength={20}
          />
        </div>

        {/* Campo de Email (apenas para cadastro) */}
        {activeTab === "register" && (
          <div className="form-group">
            <label htmlFor="email">Email (opcional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        )}

        {/* Exibição de Erro */}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Enviando..." : activeTab === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default AuthModal;