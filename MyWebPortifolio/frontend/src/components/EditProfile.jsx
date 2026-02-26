import React, { useState, useEffect } from "react";
import "../styles/editprofile.css";

// Configurações constantes
const API_BASE_URL =  import.meta.env.VITE_API_URL + "/usuario";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbfrjuodw/image/upload";
const UPLOAD_PRESET = "perfil_usuarios"; 

const EditProfile = ({ onClose, token }) => {
  const defaultImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  // Estados de Controle
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  // Estados de Imagem
  const [fotoUrl, setFotoUrl] = useState(defaultImage);
  const [fotoFile, setFotoFile] = useState(null);

  // Estado para controlar a caixinha de "Anônimo" (Booleano independente)
  const [isAnonimo, setIsAnonimo] = useState(false);

  // Estados dos Campos
  const [formData, setFormData] = useState({
    nomePublico: "", 
    telefone: "",
    pais: "",
    cidade: "",
    profissao: "",
    github: "",
    linkedin: "",
    bio: "",
  });

  // Busca inicial dos dados
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/meus-dados`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const json = await response.json();
          const user = Array.isArray(json.dados) ? json.dados[0] : json.dados;

          setUserData(user);
          setFotoUrl(user.fotoPerfil || defaultImage);
          
          // Lendo o booleano diretamente do banco de dados
          setIsAnonimo(user.isAnonimo || false);

          // Preenche o formulário com o que já existe no banco
          setFormData({
            nomePublico: user.nomePublico || "", 
            telefone: user.telefone || "",
            pais: user.pais || "",
            cidade: user.cidade || "",
            profissao: user.profissao || "",
            github: user.gitHub || "",
            linkedin: user.linkedin || "",
            bio: user.bio || "",
          });
        }
      } catch (err) {
        console.error("Falha ao carregar perfil:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) carregarPerfil();
  }, [token]);

  // Manipuladores de Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoUrl(URL.createObjectURL(file));
      setFotoFile(file);
    }
  };

  // Upload para Cloudinary
  const uploadImagem = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
    if (!res.ok) throw new Error("Erro no upload da imagem");
    const result = await res.json();
    return result.secure_url;
  };

  // Envio Final para o Java
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let urlImagemFinal = userData?.fotoPerfil || null;

      if (fotoFile) {
        urlImagemFinal = await uploadImagem(fotoFile);
      }

      // Prepara o Payload (Agora enviamos o nome e o booleano separadamente, igual ao seu DTO)
      const payload = {
        nomePublico: formData.nomePublico || null, 
        isAnonimo: isAnonimo, // 👈 Enviando o booleano pro Java
        profissao: formData.profissao || null,
        telefone: formData.telefone || null,
        pais: formData.pais || null,
        cidade: formData.cidade || null,
        gitHub: formData.github || null, // No DTO está gitHub, mantemos o padrão
        linkedin: formData.linkedin || null,
        bio: formData.bio || null,
        fotoPerfil: urlImagemFinal
      };

      // Patch na API
      const response = await fetch(`${API_BASE_URL}/meus-dados/atualizar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Perfil atualizado com sucesso! ✨");
        onClose();
      } else {
        const error = await response.json();
        // Caso o Spring Boot retorne os erros de validação (ex: telefone inválido)
        alert(`Erro: ${error.message || "Verifique os dados informados e tente novamente."}`);
      }
    } catch (err) {
      alert("Erro de conexão ou no upload da imagem.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="edit-profile-container">
        <div className="edit-header"><h2>Sincronizando dados...</h2></div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container animate-fadeIn">
      <div className="edit-header">
        <h2>Editar Perfil</h2>
        <button className="btn-close" onClick={onClose} disabled={isSaving}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        {/* SEÇÃO DA FOTO */}
        <div className="foto-upload-section">
          <div className="foto-preview">
            <img src={fotoUrl} alt="Avatar" />
            <label className="foto-overlay">
              <span>📷 Alterar</span>
              <input type="file" accept="image/*" onChange={handleFotoChange} hidden />
            </label>
          </div>
        </div>

        <div className="form-grid">
          <div className="input-group disabled">
            <label>Username</label>
            <input type="text" value={userData?.userName || ""} disabled />
          </div>
          <div className="input-group disabled">
            <label>E-mail</label>
            <input type="text" value={userData?.email || ""} disabled />
          </div>

          {/* Campo Nome Público + Checkbox Anônimo */}
          <div className="input-group">
            <label>Nome Público</label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input 
                type="text" 
                name="nomePublico" 
                value={formData.nomePublico} 
                onChange={handleChange} 
                placeholder="Como quer ser chamado?" 
                style={{ flex: 1 }}
              />
              
            </div>
            <label style={{margin: "10px 0 0 0", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: isAnonimo ? "#4caf50" : "#a0aec0", whiteSpace: "nowrap", fontWeight: isAnonimo ? "bold" : "normal" , textTransform: "none"}}>
                <input 
                  type="checkbox" 
                  checked={isAnonimo} 
                  onChange={(e) => setIsAnonimo(e.target.checked)} 
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                Ocultar Nome e Foto do Perfil
              </label>
          </div>

          <div className="input-group">
            <label>Profissão</label>
            <input type="text" name="profissao" value={formData.profissao} onChange={handleChange} placeholder="Ex: Backend Developer" />
          </div>
          <div className="input-group">
            <label>Telefone</label>
            <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="+5548999999999" />
          </div>
          <div className="input-group">
            <label>País</label>
            <input type="text" name="pais" value={formData.pais} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Cidade</label>
            <input type="text" name="cidade" value={formData.cidade} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>GitHub (URL)</label>
            <input type="url" name="github" value={formData.github} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>LinkedIn (URL)</label>
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} />
          </div>
        </div>

        <div className="input-group bio-group">
          <label>Sobre mim (Bio)</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} rows="5" placeholder="Conte sua história..."></textarea>
          <small className="char-count">{formData.bio.length}/1000</small>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button type="submit" className="btn-save" disabled={isSaving}>
            {isSaving ? "Processando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;