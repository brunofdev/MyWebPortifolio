import React, { useState } from "react";
import "../styles/authmodal.css";

const API_URLS = {
  login: "http://192.168.0.41:8080/auth/login",
  register: "http://192.168.0.41:8080/usuario/cadastro",
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
    name: "",
    userName: "",
    password: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = activeTab === "login";

  const isNameValid = !isLogin && formData.name &&
    formData.name.length >= 5 &&
    formData.name.length <= 100 &&
    /^[A-Za-zÀ-ú\s'-]+$/.test(formData.name);

  const isUserNameValid = formData.userName &&
    (!isLogin ? true : formData.userName.length >= 5) && 
    (isLogin || (formData.userName.length <= 20 && /^\S+$/.test(formData.userName)));

  const isPasswordValid = formData.password &&
    (!isLogin ? true : formData.password.length >= 8) &&
    (isLogin || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password));

  const isEmailValid = !isLogin || !formData.email || (
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    /^\S+$/.test(formData.email)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!isLogin) {
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
    setFormData({ name: "", userName: "", password: "", email: "" });
    setError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    if (!formData.userName || !formData.password) {
      setError("Nome de usuário e senha são obrigatórios.");
      return false;
    }
    if (isLogin) {
      return true;
    } else {
        if (!formData.name) {
            setError("O nome não pode estar em branco.");
            return false;
          }
          if (formData.name.length < 5 || formData.name.length > 100) {
            setError("O nome deve ter entre 5 e 100 caracteres.");
            return false;
          }
          if (!/^[A-Za-zÀ-ú\s'-]+$/.test(formData.name)) {
            setError("O nome deve conter apenas letras, espaços, hífens ou apóstrofos.");
            return false;
          }
          if (formData.userName.length < 5 || formData.userName.length > 20) {
            setError("O nome de usuário deve ter entre 5 e 20 caracteres.");
            return false;
          }
          if (!/^\S+$/.test(formData.userName)) {
            setError("O nome de usuário não pode conter espaços em branco.");
            return false;
          }
          if (formData.password.length < 8) {
            setError("A senha deve ter no mínimo 8 caracteres.");
            return false;
          }
          if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
            setError("A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).");
            return false;
          }
          if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("O formato do e-mail é inválido.");
            return false;
          }
          if (formData.email && !/^\S+$/.test(formData.email)) {
            setError("O e-mail não pode conter espaços em branco.");
            return false;
          }
          return true;
    }
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
      const url = isLogin ? API_URLS.login : API_URLS.register;
      const payload = isLogin
        ? { cpf: formData.userName, senha: formData.password }
        : {
            nome: formData.name,
            email: formData.email || "",
            userName: formData.userName,
            senha: formData.password,
          };

      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('Resposta completa da API:', data);

      if (!response.ok) {
        console.error('Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          payload: payload,
          data: data
        });

        setError(
          data.status === false && data.erro?.message
            ? data.erro.message
            : response.status >= 500
            ? "Servidor indisponível após várias tentativas."
            : response.status === 401 || response.status === 403
            ? "Credenciais inválidas, tente novamente."
            : "Ocorreu um erro desconhecido."
        );
        setIsLoading(false);
        return;
      }

      if (data.status === true) {
        if (isLogin) {
          console.log('Dados para login success:', data.dados);
          const loginData = {
            token: data.dados.token,
            user: data.dados.userResponseDTO || {},
          };
          handleLoginSuccess(loginData);
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
      console.error('Erro de conexão ou execução na API:', {
        message: error.message,
        stack: error.stack,
        url: isLogin ? API_URLS.login : API_URLS.register,
        payload: isLogin ? { userName: formData.userName, password: formData.password } : { ...formData }
      });
      setError("Erro de conexão com o servidor. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-modal">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
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
          <h2>{activeTab === "login" ? "Entrar" : "Criar Conta"}</h2>
          {isLoading && <div className="loading-bar" />}
          {activeTab === "register" && (
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-label="Nome completo"
                  aria-invalid={formData.name && !isNameValid ? "true" : "false"}
                  className={formData.name && isNameValid ? "valid" : ""}
                />
              </div>
              <div className="instruction-message">
                Nome deve ter 5-100 caracteres, apenas letras, espaços, hífens ou apóstrofos.
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="userName">Usuário</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                aria-label="Nome de usuário"
                aria-invalid={formData.userName && !isUserNameValid ? "true" : "false"}
                className={formData.userName && isUserNameValid ? "valid" : ""}
              />
            </div>
            {activeTab === "register" && (
              <div className="instruction-message">
                Nome de usuário deve ter 5-20 caracteres, sem espaços.
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                aria-label="Senha"
                aria-invalid={formData.password && !isPasswordValid ? "true" : "false"}
                className={formData.password && isPasswordValid ? "valid" : ""}
              />
            </div>
            {activeTab === "register" && (
              <div className="instruction-message">
                Senha deve ter no mínimo 8 caracteres, com uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&).
              </div>
            )}
          </div>

          {activeTab === "register" && (
            <div className="form-group">
              <label htmlFor="email">Email (opcional)</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-label="Endereço de email"
                  aria-invalid={formData.email && !isEmailValid ? "true" : "false"}
                  className={formData.email && isEmailValid ? "valid" : ""}
                />
              </div>
              <div className="instruction-message">
                Email deve ser válido e sem espaços (opcional).
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Enviando...
              </>
            ) : activeTab === "login" ? (
              "Entrar"
            ) : (
              "Cadastrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;