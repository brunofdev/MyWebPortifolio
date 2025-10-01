import React, { useState } from "react";
import "../styles/authmodal.css";

// URLs da API centralizadas
const API_URLS = {
  login: "https://apigateway-qao8.onrender.com/api/auth/login",
  register: "https://apigateway-qao8.onrender.com/api/users/register",
};

const AuthModal = ({ handleLoginSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    userName: "",
    password: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza os campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !/^[a-zA-Z\s\-\']*$/.test(value)) {
      setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos.");
      return;
    }
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  // Muda entre abas (login/cadastro) e limpa o estado
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ name: "", userName: "", password: "", email: "" });
    setError("");
    setSuccessMessage("");
  };

  // Valida os dados do formulário
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
      setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos.");
      return false;
    }
    return true;
  };

  // Envia o formulário (login ou cadastro)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const isLogin = activeTab === "login";
    if (!validateForm(isLogin)) {
      setIsLoading(false);
      return;
    }

    try {
      const url = isLogin ? API_URLS.login : API_URLS.register;
      const payload = isLogin
        ? { userName: formData.userName, password: formData.password }
        : {
            name: formData.name,
            userName: formData.userName,
            password: formData.password,
            email: formData.email,
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.status === false && data.erro?.message
            ? data.erro.message
            : response.status >= 500
            ? "Servidor indisponível, tente novamente mais tarde."
            : response.status === 401 || response.status === 403
            ? "Credenciais inválidas, tente novamente."
            : "Ocorreu um erro desconhecido."
        );
        setIsLoading(false);
        return;
      }

      if (data.status === true) {
        if (isLogin) {
          handleLoginSuccess({ token: data.dados?.token || data.token });
          onClose();
        } else {
          setSuccessMessage(
            `Cadastro realizado com sucesso, ${data.dados.nome || "usuário"}! Bem-vindo(a)!`
          );
          setTimeout(() => handleTabChange("login"), 3000);
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
      <button
        className="close-button"
        onClick={onClose}
        aria-label="Fechar modal"
      >
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

        <div className="form-group">
          <label htmlFor="userName">Nome de Usuário</label>
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

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Enviando..." : activeTab === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default AuthModal;