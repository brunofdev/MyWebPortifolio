import React, { useState, useEffect, useRef } from "react";
import "../../styles/manageprojects.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbfrjuodw/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "perfil_usuarios";

const ManageProjects = () => {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const dragItem = useRef();
  const dragOverItem = useRef();

  const initialFormState = {
    title: "",
    video: "",
    description: "",
    status: "Concluído",
    dataProjeto: "",
    papel: "",
    repositorioUrl: "", 
    liveUrl: "",        
    techs: { 
      linguagem: "", paradigma: "", framework: "", bibliotecas: "", infraestrutura: ""
    },
    setup: { 
      obs: "", steps: [] 
    },
    links: [], 
    imagens: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchProjetos(); }, []);

  const fetchProjetos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/paineladm/projetos`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjetos(data.dados || data || []);
      }
    } catch (error) { console.error("Erro ao carregar projetos:", error); }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTechChange = (e) => {
    setFormData({
      ...formData,
      techs: { ...formData.techs, [e.target.name]: e.target.value }
    });
  };

  const handleSetupObsChange = (e) => {
    setFormData({
      ...formData,
      setup: { ...formData.setup, obs: e.target.value }
    });
  };

  const addStep = () => {
    const newStep = { num: formData.setup.steps.length + 1, text: "", cmd: "" };
    setFormData({
      ...formData,
      setup: { ...formData.setup, steps: [...formData.setup.steps, newStep] }
    });
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = formData.setup.steps.map((step, i) => {
      if (i === index) return { ...step, [field]: value };
      return step;
    });
    setFormData({ ...formData, setup: { ...formData.setup, steps: updatedSteps } });
  };

  const removeStep = (index) => {
    const updatedSteps = formData.setup.steps.filter((_, i) => i !== index);
    const renumberedSteps = updatedSteps.map((step, i) => ({ ...step, num: i + 1 }));
    setFormData({ ...formData, setup: { ...formData.setup, steps: renumberedSteps } });
  };

  // =========================================
  // AJUSTES NA GESTÃO DE IMAGENS E LEGENDAS
  // =========================================
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const novasImagens = files.map(file => ({
      file: file, 
      url: URL.createObjectURL(file), 
      isNova: true,
      legenda: "" // 👈 AQUI: Imagem nova nasce com legenda vazia
    }));
    setFormData((prev) => ({ ...prev, imagens: [...prev.imagens, ...novasImagens] }));
  };

  // 👈 AQUI: Função para atualizar o texto da legenda de uma imagem específica
  const handleLegendChange = (index, text) => {
    const updatedImages = formData.imagens.map((img, i) => {
      if (i === index) return { ...img, legenda: text };
      return img;
    });
    setFormData({ ...formData, imagens: updatedImages });
  };

  const dragStart = (e, position) => { dragItem.current = position; };
  const dragEnter = (e, position) => { dragOverItem.current = position; };
  const drop = () => {
    const copyListItems = [...formData.imagens];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setFormData({ ...formData, imagens: copyListItems });
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    const novasImagens = [...formData.imagens];
    const item = novasImagens.splice(index, 1)[0];
    novasImagens.unshift(item);
    setFormData({ ...formData, imagens: novasImagens });
  };

  const removeImage = (index) => {
    const novasImagens = formData.imagens.filter((_, i) => i !== index);
    setFormData({ ...formData, imagens: novasImagens });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imagens.length === 0) {
      showMessage("error", "⚠️ Adicione pelo menos uma imagem.");
      return;
    }

    setLoading(true);
    showMessage("success", "⏳ Iniciando processamento...");

    try {
      const imagensProcessadas = await Promise.all(
        formData.imagens.map(async (img) => {
          if (!img.isNova) return img.url;
          const formUpload = new FormData();
          formUpload.append("file", img.file);
          formUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
          const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formUpload });
          if (!res.ok) throw new Error("Falha no upload das imagens.");
          const data = await res.json();
          return data.secure_url;
        })
      );

      // 👈 AQUI: Agora montamos o galeriaComOrdem enviando a legenda pro Java!
      const galeriaComOrdem = imagensProcessadas.map((url, index) => ({
        urlImagem: url, 
        ordemExibicao: index, 
        isCapa: index === 0,
        legenda: formData.imagens[index].legenda || "" // Pega a legenda que o usuário digitou
      }));

      const payload = {
        ...formData,
        galeria: galeriaComOrdem,
        links: [
          { text: "Repositório GitHub", url: formData.repositorioUrl },
          { text: "Site Online (Live)", url: formData.liveUrl }
        ].filter(link => link.url) 
      };

      const token = localStorage.getItem("token");
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing ? `${BASE_URL}/paineladm/projetos/${editId}` : `${BASE_URL}/paineladm/projetos`;

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      let apiData;
      try { apiData = await response.json(); } catch (e) { apiData = null; }

      if (response.ok) {
        showMessage("success", apiData?.message || "🎉 Projeto salvo com sucesso!");
        resetForm();
        fetchProjetos();
      } else {
        const errorMsg = apiData?.message || "Erro desconhecido ao salvar.";
        if (response.status === 401 || response.status === 403) {
          showMessage("error", "🚫 Sessão expirada. Faça login novamente.");
        } else {
          showMessage("error", `❌ ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error(error);
      showMessage("error", "🌐 Erro de conexão: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEditClick = (projeto) => {
    setIsEditing(true);
    setEditId(projeto.id);
    let imagensFormatadas = [];
    if (projeto.galeria && projeto.galeria.length > 0) {
      imagensFormatadas = [...projeto.galeria]
        .sort((a, b) => a.ordemExibicao - b.ordemExibicao)
        .map(img => ({ 
          url: img.urlImagem, 
          isNova: false, 
          legenda: img.legenda || "" // 👈 AQUI: Puxa a legenda do banco na hora de editar
        }));
    }
    setFormData({
      title: projeto.title || "", video: projeto.video || "", description: projeto.description || "",
      status: projeto.status || "Concluído", papel: projeto.papel || "", dataProjeto: projeto.dataProjeto || "",
      repositorioUrl: projeto.repositorioUrl || "", 
      liveUrl: projeto.liveUrl || "",               
      techs: projeto.techs || initialFormState.techs,
      setup: projeto.setup || initialFormState.setup,
      links: projeto.links || [],
      imagens: imagensFormatadas
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este projeto?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${BASE_URL}/paineladm/projetos/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) { 
        showMessage("success", "Projeto excluído!"); 
        fetchProjetos(); 
      } else { 
        showMessage("error", "Erro ao excluir."); 
      }
    } catch (error) { showMessage("error", "Erro de conexão."); }
  };

  return (
    <div className="manage-projects-container">
      <div className="admin-form-section">
        <div className="section-header">
          <h2>{isEditing ? "✏️ Editar Projeto" : "🚀 Adicionar Novo Projeto"}</h2>
          {isEditing && <button className="btn-cancel-small" onClick={resetForm}>Cancelar Edição</button>}
        </div>

        {message.text && <div className={`admin-message ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-card">
            <h3>📝 Informações Gerais</h3>
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Título do Projeto *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Concluído">Concluído</option>
                  <option value="Em Andamento">Em Andamento</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descrição Principal *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required></textarea>
            </div>

            <div className="form-group">
              <label>Link do Vídeo (YouTube Embed)</label>
              <input type="url" name="video" value={formData.video} onChange={handleChange} placeholder="Ex: https://www.youtube.com/embed/..." />
            </div>
          </div>

          <div className="form-card">
            <h3>⚙️ Ficha Técnica</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Linguagem</label>
                <input type="text" name="linguagem" value={formData.techs.linguagem} onChange={handleTechChange} placeholder="Ex: Java 21" />
              </div>
              <div className="form-group">
                <label>Paradigma</label>
                <input type="text" name="paradigma" value={formData.techs.paradigma} onChange={handleTechChange} placeholder="Ex: POO" />
              </div>
              <div className="form-group">
                <label>Framework</label>
                <input type="text" name="framework" value={formData.techs.framework} onChange={handleTechChange} placeholder="Ex: Spring Boot" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bibliotecas</label>
                <input type="text" name="bibliotecas" value={formData.techs.bibliotecas} onChange={handleTechChange} placeholder="Ex: Hibernate, Swagger" />
              </div>
              <div className="form-group">
                <label>Infraestrutura</label>
                <input type="text" name="infraestrutura" value={formData.techs.infraestrutura} onChange={handleTechChange} placeholder="Ex: Docker, AWS" />
              </div>
            </div>
          </div>

          <div className="form-card">
            <h3>🛠️ Como Rodar e Testar (Setup)</h3>
            <div className="form-group">
              <label>Observação / Pré-requisitos</label>
              <input type="text" value={formData.setup.obs} onChange={handleSetupObsChange} placeholder="Ex: Pré-requisito: Docker instalado" />
            </div>

            <div className="steps-container">
              <label style={{ color: '#a0aec0', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Passos do Setup</label>
              {formData.setup.steps.map((step, index) => (
                <div key={index} className="form-row" style={{ alignItems: 'flex-end', background: '#1a1a1a', padding: '10px', borderRadius: '8px' }}>
                  <div className="form-group" style={{ flex: '0 0 50px' }}>
                    <label>Nº</label>
                    <input type="text" value={step.num} disabled style={{ textAlign: 'center' }} />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Ação (Texto)</label>
                    <input type="text" value={step.text} onChange={(e) => handleStepChange(index, "text", e.target.value)} placeholder="Ex: Clone o repositório" />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Comando (Código)</label>
                    <input type="text" value={step.cmd} onChange={(e) => handleStepChange(index, "cmd", e.target.value)} placeholder="Ex: git clone..." />
                  </div>
                  <button type="button" onClick={() => removeStep(index)} style={{ padding: '14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', height: 'fit-content', marginBottom: '8px' }}>X</button>
                </div>
              ))}
              <button type="button" onClick={addStep} style={{ padding: '10px', background: '#38a169', color: '#1a1a1a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>+ Adicionar Passo</button>
            </div>
          </div>

          <div className="form-card media-card">
            <h3>🖼️ Galeria de Imagens (Capa)</h3>
            <div className="upload-zone">
              <input type="file" multiple accept="image/*" id="file-upload" onChange={handleFileUpload} />
              <label htmlFor="file-upload">☁️ Clique ou Arraste imagens aqui</label>
            </div>

            {formData.imagens.length > 0 && (
              <div className="image-manager-grid">
                {formData.imagens.map((imgObj, index) => (
                  <div 
                    key={index} 
                    className={`image-thumbnail-box ${index === 0 ? "is-cover" : ""}`} 
                    draggable 
                    onDragStart={(e) => dragStart(e, index)} 
                    onDragEnter={(e) => dragOverItem.current = index} 
                    onDragEnd={drop} 
                    onDragOver={(e) => e.preventDefault()}
                    style={{ display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '220px' }} // Ajuste pro grid caber o input
                  >
                    {index === 0 && <span className="cover-badge">★ CAPA</span>}
                    <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                      <img src={imgObj.url} alt={`Preview ${index}`} className="thumbnail-img" />
                      <div className="thumbnail-actions">
                        <button type="button" onClick={() => setAsCover(index)} title="Definir Capa">⭐</button>
                        <button type="button" className="btn-trash" onClick={() => removeImage(index)}>🗑️</button>
                      </div>
                    </div>
                    {/* 👇 O NOVO INPUT DE LEGENDA AQUI 👇 */}
                    <input 
                      type="text" 
                      placeholder="Adicione uma legenda..." 
                      value={imgObj.legenda || ""} 
                      onChange={(e) => handleLegendChange(index, e.target.value)}
                      style={{ 
                        width: '100%', padding: '8px', border: 'none', borderTop: '1px solid #333', 
                        background: '#111', color: '#fff', fontSize: '0.85rem', outline: 'none' 
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="form-card" style={{marginTop: '20px'}}>
              <h3>🔗 Links de Acesso</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>URL do Repositório (GitHub) *</label>
                  <input type="url" name="repositorioUrl" value={formData.repositorioUrl} onChange={handleChange} placeholder="https://github.com/..." required />
                </div>
                <div className="form-group">
                  <label>URL do Projeto Online (Live Preview)</label>
                  <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} placeholder="https://meuprojeto.com" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-save-mega" disabled={loading}>
            {loading ? "Processando..." : (isEditing ? "Atualizar Projeto" : "Publicar Projeto")}
          </button>
        </form>
      </div>

      <div className="admin-list-section" style={{ marginTop: '50px' }}>
        <div className="section-header" style={{ borderBottom: '1px solid rgba(72, 187, 120, 0.3)', paddingBottom: '15px' }}>
          <h2 style={{ color: '#48bb78', margin: 0, fontSize: '1.5rem' }}>🗂️ Projetos Cadastrados</h2>
        </div>

        {projetos.length === 0 ? (
          <p style={{ color: '#a0aec0', marginTop: '20px' }}>Nenhum projeto cadastrado no banco de dados.</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px', 
            marginTop: '20px' 
          }}>
            {projetos.map((projeto) => {
              const capaObj = projeto.galeria?.find(img => img.isCapa) || projeto.galeria?.[0];
              const capaUrl = capaObj ? capaObj.urlImagem : "https://via.placeholder.com/300x200?text=Sem+Imagem";

              return (
                <div key={projeto.id} style={{ 
                  background: '#1a1a1a', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid #333',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <img src={capaUrl} alt={projeto.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  
                  <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.1rem' }}>{projeto.title}</h4>
                    
                    <p style={{ margin: '0 0 15px 0', color: '#a0aec0', fontSize: '0.9rem', flexGrow: 1 }}>
                      Status: <strong style={{ color: projeto.status === 'Concluído' ? '#48bb78' : '#eab308' }}>{projeto.status}</strong>
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleEditClick(projeto)} 
                        style={{ flex: 1, padding: '10px', background: 'transparent', color: '#48bb78', border: '1px solid #48bb78', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                        onMouseOver={(e) => { e.target.style.background = '#48bb78'; e.target.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#48bb78'; }}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(projeto.id)} 
                        style={{ padding: '10px 15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}
                        onMouseOver={(e) => { e.target.style.background = '#dc2626'; }}
                        onMouseOut={(e) => { e.target.style.background = '#ef4444'; }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProjects;