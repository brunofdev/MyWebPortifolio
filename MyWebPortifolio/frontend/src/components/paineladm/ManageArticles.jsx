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
// ==========================================

const ManageArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
    console.log("Enviando payload para o Java...", payload);
    setLoading(true);
    showMessage("success", "⏳ Enviando artigo para o servidor...");

    try {
      const token = localStorage.getItem("token");
      const method = isEditing ? "PUT" : "POST";
      
      // Usa a rota centralizada no topo
      const endpoint = isEditing 
        ? API_ROUTES.ATUALIZAR(editData.id) 
        : API_ROUTES.CRIAR;

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let apiData = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        apiData = await response.json();
      }

      if (response.ok) {
        showMessage("success", "🎉 Artigo salvo com sucesso!");
        resetForm();
        fetchArticles();
      } else {
        const errorMsg = apiData.message || apiData.error || `Erro HTTP ${response.status}: O Java recusou.`;
        showMessage("error", `❌ ${errorMsg}`);
        throw new Error(errorMsg); 
      }
    } catch (error) {
      showMessage("error", "🌐 Falha na comunicação: " + error.message);
      throw error; 
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

  return (
    <div className="manage-projects-container">
      <div className="admin-form-section">
        <div className="section-header">
          <h2>{isEditing ? "✏️ Editando Artigo" : "✍️ Novo Artigo"}</h2>
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

      {/* LISTAGEM DE ARTIGOS SALVOS */}
      <div className="admin-list-section" style={{ marginTop: "50px" }}>
        <div className="section-header">
          <h2 style={{ color: "#48bb78" }}>📚 Seus Artigos</h2>
        </div>

        <div className="image-manager-grid" style={{ marginTop: "20px" }}>
          {articles.map((art) => (
            <div key={art.id} className="image-thumbnail-box" style={{ minHeight: "200px" }}>
              <img 
                src={art.coverImage || "https://via.placeholder.com/150"} 
                alt={art.title} 
                className="thumbnail-img" 
              />
              <div style={{ padding: "10px" }}>
                <h4 style={{ color: "#fff", fontSize: "0.9rem" }}>{art.title}</h4>
                <p style={{ color: "#666", fontSize: "0.7rem" }}>/{art.slug}</p>
                <div className="thumbnail-actions" style={{ position: "static", marginTop: "10px" }}>
                  <button onClick={() => handleEditClick(art)}>✏️</button>
                  <button className="btn-trash" onClick={() => handleDelete(art.id)}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageArticles;