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

  // 1. ESTADO ALINHADO COM O COMPONENTE Projects.jsx
  const initialFormState = {
    title: "",
    video: "",
    description: "",
    status: "Concluído",
    dataProjeto: "",
    papel: "",
    techs: { // Objeto alinhado com o Front
      linguagem: "",
      paradigma: "",
      framework: "",
      bibliotecas: "",
      infraestrutura: ""
    },
    setup: { // Objeto alinhado com o Front
      obs: "",
      steps: [] // Começa vazio, adicionaremos os passos dinamicamente
    },
    links: [], // Para os links do Github, etc.
    imagens: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchProjetos(); }, []);

  const fetchProjetos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/projetos`);
      if (response.ok) {
        const data = await response.json();
        setProjetos(data.dados || data || []);
      }
    } catch (error) { console.error("Erro:", error); }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  // 2. HANDLERS PARA DADOS ANINHADOS (Nested Objects)
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

  // 3. GERENCIAMENTO DINÂMICO DE PASSOS (STEPS)
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
    // Re-numerar os passos após remoção
    const renumberedSteps = updatedSteps.map((step, i) => ({ ...step, num: i + 1 }));
    setFormData({ ...formData, setup: { ...formData.setup, steps: renumberedSteps } });
  };

  // 4. LÓGICA DE IMAGENS MANTIDA IGUAL
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const novasImagens = files.map(file => ({
      file: file, url: URL.createObjectURL(file), isNova: true
    }));
    setFormData((prev) => ({ ...prev, imagens: [...prev.imagens, ...novasImagens] }));
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

  // 5. SALVAMENTO E MONTAGEM DO PAYLOAD (ALINHADO COM O JAVA/FRONT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imagens.length === 0) {
      showMessage("error", "Adicione pelo menos uma imagem.");
      return;
    }

    setLoading(true);
    showMessage("success", "⏳ Iniciando upload das imagens para a nuvem...");

    try {
      const imagensProcessadas = await Promise.all(
        formData.imagens.map(async (img) => {
          if (!img.isNova) return img.url;
          const formUpload = new FormData();
          formUpload.append("file", img.file);
          formUpload.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
          const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formUpload });
          const data = await res.json();
          if (!data.secure_url) throw new Error("Falha ao subir imagem. Verifique as chaves do Cloudinary.");
          return data.secure_url;
        })
      );

      showMessage("success", "✅ Upload concluído! Salvando no banco de dados...");

      const galeriaComOrdem = imagensProcessadas.map((url, index) => ({
        urlImagem: url, ordemExibicao: index, isCapa: index === 0
      }));

      // O Payload agora envia objetos completos e listas (O Java precisa receber isso como JSON embutido ou tabelas filhas)
      const payload = {
        ...formData,
        galeria: galeriaComOrdem,
        // Criamos o array de links que o componente publico espera receber
        links: [
          { text: "Repositório GitHub", url: formData.repositorioUrl },
          { text: "Site Online (Live)", url: formData.liveUrl }
        ].filter(link => link.url) // Remove links vazios
      };
      const token = localStorage.getItem("token");
      const method = isEditing ? "PUT" : "POST";
      // AJUSTADO: Agora batendo na rota protegida /paineladm/
      const endpoint = isEditing ? `${BASE_URL}/paineladm/projetos/${editId}` : `${BASE_URL}/paineladm/projetos`;

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showMessage("success", "🎉 Projeto salvo com sucesso!");
        resetForm();
        fetchProjetos();
      }
    } catch (error) {
      showMessage("error", "❌ Erro: " + error.message);
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
        .map(img => ({ url: img.urlImagem, isNova: false }));
    }
    setFormData({
      title: projeto.title || "", video: projeto.video || "", description: projeto.description || "",
      status: projeto.status || "Concluído", papel: projeto.papel || "", dataProjeto: projeto.dataProjeto || "",
      techs: projeto.techs || initialFormState.techs, // Preenche com os dados que vieram do BD
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
      const response = await fetch(`${BASE_URL}/projetos/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (response.ok) { showMessage("success", "Projeto excluído!"); fetchProjetos(); }
      else { showMessage("error", "Erro ao excluir."); }
    } catch (error) { showMessage("error", "Erro de conexão."); }
  };

  return (
    <div className="manage-projects-container">
      <div className="admin-form-section">
        <div className="section-header">
          <h2>{isEditing ? "✏️ Editar Projeto" : "🚀 Adicionar Novo Projeto"}</h2>
          {isEditing && <button className="btn-cancel-small" onClick={resetForm}>Cancelar</button>}
        </div>

        {message.text && <div className={`admin-message ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit} className="admin-form">

          {/* BLOCO 1: INFORMAÇÕES GERAIS */}
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

          {/* BLOCO 2: FICHA TÉCNICA (Objeto techs) */}
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

          {/* BLOCO 3: SETUP E PASSOS (Array Dinâmico) */}
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

          {/* MÍDIA E GALERIA */}
          <div className="form-card media-card">
            <h3>🖼️ Galeria de Imagens (Capa)</h3>
            <div className="upload-zone">
              <input type="file" multiple accept="image/*" id="file-upload" onChange={handleFileUpload} />
              <label htmlFor="file-upload" className="upload-label">☁️ Clique ou Arraste imagens aqui</label>
            </div>

            {formData.imagens.length > 0 && (
              <div className="image-manager-grid">
                {formData.imagens.map((imgObj, index) => (
                  <div
                    key={index}
                    className={`image-thumbnail-box ${index === 0 ? "is-cover" : ""}`}
                    draggable
                    onDragStart={(e) => dragStart(e, index)}
                    onDragEnter={(e) => dragEnter(e, index)}
                    onDragEnd={drop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {index === 0 && <span className="cover-badge">★ CAPA</span>}
                    <img src={imgObj.url} alt={`Preview ${index}`} className="thumbnail-img" />
                    <div className="thumbnail-actions">
                      <button type="button" onClick={() => setAsCover(index)} title="Definir Capa">⭐</button>
                      <button type="button" className="btn-trash" onClick={() => removeImage(index)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* BLOCO 4: LINKS EXTERNOS */}
            <div className="form-card">
              <h3>🔗 Links de Acesso</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>URL do Repositório (GitHub) *</label>
                  <input
                    type="url"
                    name="repositorioUrl"
                    value={formData.repositorioUrl || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>URL do Projeto Online (Live Preview)</label>
                  <input
                    type="url"
                    name="liveUrl"
                    value={formData.liveUrl || ""}
                    onChange={handleChange}
                    placeholder="https://meuprojeto.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-save-mega" disabled={loading}>
            {loading ? "Processando..." : (isEditing ? "Atualizar Projeto" : "Publicar Projeto")}
          </button>
        </form>
      </div>

      <div className="admin-list-section">
        {/* Listagem Simplificada */}
      </div>
    </div>
  );
};

export default ManageProjects;