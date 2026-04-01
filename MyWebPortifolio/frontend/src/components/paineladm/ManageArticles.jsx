import React, { useState, useEffect } from "react";
import ArticleEditor from "./ArticleEditor"; 
import "../../styles/manageprojects.css"; 

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const API_ROUTES = {
  LISTAR_TODOS: `${BASE_URL}/geral/artigos/listar-todos`,
  CRIAR:        `${BASE_URL}/paineladm/artigos/criar`,
  ATUALIZAR:    (id) => `${BASE_URL}/paineladm/artigos/atualizar/${id}`,
  EXCLUIR:      (id) => `${BASE_URL}/paineladm/artigos/excluir/${id}`
};

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ROUTES.LISTAR_TODOS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data.dados || data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handlePublish = async (payload) => {
    setLoading(true);
    // Aqui você une os dados do formulário com o ID necessário para o PUT
    const finalPayload = isEditing ? { ...payload, id: editData.id } : payload;
    
    showMessage("success", "⏳ Enviando artigo para o servidor...");

    try {
      const token = localStorage.getItem("token");
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing ? API_ROUTES.ATUALIZAR(editData.id) : API_ROUTES.CRIAR;

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // 👉 CORREÇÃO: Enviamos o finalPayload (com o ID) e não o payload original
        body: JSON.stringify(finalPayload), 
      });

      let apiData = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        apiData = await response.json();
      }

      if (response.ok) {
        showMessage("success", `🎉 Artigo ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        resetForm();
        fetchArticles();
      } else {
        const errorMsg = apiData.erro.message || apiData.erro.status || `Erro HTTP ${response.status}`;
        showMessage("error", `❌ ${errorMsg}`);
      }
    } catch (error) {
      showMessage("error", "🌐 Falha na comunicação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const handleEditClick = (article) => {
    setEditData(article);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir este artigo permanentemente?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ROUTES.EXCLUIR(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        showMessage("success", "Artigo removido!");
        fetchArticles();
      }
    } catch (error) {
      showMessage("error", "Erro ao excluir.");
    }
  };

  // 👉 NOVO: Formatador de Data elegante
  const formatarData = (isoDate) => {
    if (!isoDate) return "Data desconhecida";
    const data = new Date(isoDate);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const filteredArticles = articles.filter((art) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = art.title?.toLowerCase().includes(term);
    const subMatch = art.subtitle?.toLowerCase().includes(term);
    const tagMatch = art.tags?.some((tag) => tag.toLowerCase().includes(term));

    return titleMatch || subMatch || tagMatch;
  });

  return (
    <div className="manage-projects-container">
      <div className="admin-form-section">
        <div className="section-header">
          <h2>{isEditing ? "Editando Artigo" : "Novo Artigo"}</h2>
          {isEditing && (
            <button className="btn-cancel-small" onClick={resetForm}>
              Criar Novo
            </button>
          )}
        </div>

        {message.text && (
          <div className={`admin-message ${message.type}`}>{message.text}</div>
        )}

        <ArticleEditor 
          key={editData?.id || "new"}
          initialData={editData || {}} 
          onPublish={handlePublish}
          onSave={(payload) => console.log("Rascunho automático:", payload)}
        />
      </div>

      <div className="admin-list-section" style={{ marginTop: "50px" }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ color: "#48bb78", margin: 0 }}>📚 Seus Artigos</h2>
          
          <input
            type="text"
            placeholder="🔍 Buscar por título, descrição ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#1e1e1e",
              color: "#fff",
              width: "100%",
              maxWidth: "400px",
              fontSize: "0.9rem"
            }}
          />
        </div>

        <div className="image-manager-grid" style={{ marginTop: "20px" }}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((art) => (
              <div 
                key={art.id} 
                className="image-thumbnail-box" 
                style={{ minHeight: "280px", cursor: "pointer", display: "flex", flexDirection: "column", position: "relative" }}
                onClick={() => handleEditClick(art)}
              >
                {/* Imagem de Capa com Badge de Status */}
                <div style={{ position: "relative", width: "100%", height: "140px" }}>
                  <img 
                    src={art.coverImage || "https://via.placeholder.com/300x150"} 
                    alt={art.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }} 
                  />
                  {/* Badge de Status flutuante */}
                  <span style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: art.status === "PUBLICADO" ? "#48bb78" : "#d69e2e",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.4)"
                  }}>
                    {art.status}
                  </span>
                </div>

                <div style={{ padding: "12px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  {/* Título e Metadados (Data / Autor) */}
                  <h4 style={{ color: "#fff", fontSize: "1.1rem", marginBottom: "5px", lineHeight: "1.2" }}>{art.title}</h4>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#a0aec0", marginBottom: "10px", borderBottom: "1px solid #333", paddingBottom: "5px" }}>
                    <span>📅 {formatarData(art.dataCriacao)}</span>
                    <span>✍️ {art.criadoPor || "Autor"}</span>
                  </div>

                  {/* Subtítulo */}
                  <p style={{ color: "#cbd5e0", fontSize: "0.8rem", marginBottom: "10px", flexGrow: 1, lineHeight: "1.4" }}>
                    {art.subtitle?.length > 80 ? art.subtitle.substring(0, 80) + "..." : art.subtitle}
                  </p>
                  
                  {/* Tags */}
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "15px" }}>
                    {art.tags?.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: "rgba(72, 187, 120, 0.2)", color: "#48bb78", border: "1px solid #48bb78", padding: "2px 6px", borderRadius: "12px", fontSize: "0.65rem", fontWeight: "bold" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Botões de Ação */}
                  <div className="thumbnail-actions" style={{ position: "static", marginTop: "auto", display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-edit" 
                      onClick={(e) => { e.stopPropagation(); handleEditClick(art); }} 
                      style={{ flex: 1, backgroundColor: "#2d3748", color: "#fff", padding: "8px", borderRadius: "5px", border: "none", cursor: "pointer", transition: "0.2s" }}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-trash" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(art.id); }}
                      style={{ padding: "8px 12px", backgroundColor: "#e53e3e", color: "#fff", borderRadius: "5px", border: "none", cursor: "pointer" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888", textAlign: "center", gridColumn: "1 / -1", padding: "20px" }}>
              Nenhum artigo encontrado com o termo "{searchTerm}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageArticles;