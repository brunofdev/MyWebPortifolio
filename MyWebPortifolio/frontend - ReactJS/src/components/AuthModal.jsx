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
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lida com a mudança em qualquer campo de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      // Permite apenas letras, espaços, hifens e apóstrofos no campo nome
      if (!/^[a-zA-Z\s\-\']*$/.test(value)) {
        setError("O nome deve conter apenas letras, espaços, hifens ou apóstrofos.");
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
    setError(""); // Limpa erro ao digitar
  };

  // Lida com a mudança de aba, limpando os erros
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccessMessage("");
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
    if (!isLogin && !/^[a-zA-Z\s\-\']+$/.test(formData.name)) {
      setError("O nome deve conter apenas letras, espaços, hifens ou apóstrofos.");
      return false;
    }
    return true;
  };

  // Função única de submissão para login e registro
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
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

      const data = await response.json();

      // Verifica o status da resposta
      if (!response.ok) {
        if (data.status === false && data.erro?.message) {
          setError(data.erro.message); // Usa erro.message diretamente
        } else if (response.status === 500 || response.status === 502 || response.status === 503) {
          setError("Servidor indisponível, tente novamente mais tarde.");
        } else if (response.status === 401 || response.status === 403) {
          setError("Credenciais inválidas, tente novamente.");
        } else {
          setError("Ocorreu um erro desconhecido.");
        }
        setIsLoading(false);
        return;
      }

      // Sucesso: status === true
      if (data.status === true) {
        if (isLogin) {
          handleLoginSuccess({ token: data.dados?.token || data.token });
          onClose();
        } else {
          setSuccessMessage(data.message || "Recurso Criado");
          setTimeout(() => {
            handleTabChange("login");
          }, 2000);
        }
      } else {
        setError("Resposta inesperada do servidor.");
      }

    } catch (error) {
      setError("Erro de conexão com o servidor. Verifique sua internet e tente novamente.");
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

        {/* Exibição de Sucesso */}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Enviando..." : activeTab === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default AuthModal;