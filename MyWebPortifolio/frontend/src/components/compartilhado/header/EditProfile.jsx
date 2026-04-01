import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/editprofile.css";
import Sidebar from "../../Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_URL + "/usuario";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbfrjuodw/image/upload";
const UPLOAD_PRESET = "perfil_usuarios";

const DEFAULT_IMAGE =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const SECTIONS = [
  { id: "identidade", label: "Identidade", icon: "◈" },
  { id: "contato", label: "Contato & Local", icon: "◉" },
  { id: "links", label: "Links & Bio", icon: "◎" },
];

const InputField = ({ label, name, value, onChange, type = "text", placeholder, disabled }) => (
  <div className={`ep-field ${disabled ? "ep-field--disabled" : ""}`}>
    <label className="ep-label">{label}</label>
    <input
      className="ep-input"
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
    />
  </div>
);

export default function EditProfile() {
  const { token, handleUpdateUserPhoto } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const avatarRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [activeSection, setActiveSection] = useState("identidade");
  const [userData, setUserData] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(DEFAULT_IMAGE);
  const [fotoFile, setFotoFile] = useState(null);
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [touched, setTouched] = useState({});

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

  // Redirect if unauthenticated
  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  // Load profile
  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/meus-dados`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const user = Array.isArray(json.dados) ? json.dados[0] : json.dados;
          setUserData(user);
          setFotoUrl(user.fotoPerfil || DEFAULT_IMAGE);
          setIsAnonimo(user.isAnonimo || false);
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
    load();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setFotoUrl(URL.createObjectURL(file));
    setFotoFile(file);
  };

  const handleFotoChange = (e) => handleFileSelect(e.target.files[0]);

  // Drag & drop on avatar
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const uploadImagem = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
    if (!res.ok) throw new Error("Erro no upload");
    return (await res.json()).secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    try {
      let urlImagemFinal = userData?.fotoPerfil || null;
      if (fotoFile) urlImagemFinal = await uploadImagem(fotoFile);

      const payload = {
        nomePublico: formData.nomePublico || null,
        isAnonimo,
        profissao: formData.profissao || null,
        telefone: formData.telefone || null,
        pais: formData.pais || null,
        cidade: formData.cidade || null,
        gitHub: formData.github || null,
        linkedin: formData.linkedin || null,
        bio: formData.bio || null,
        fotoPerfil: urlImagemFinal,
      };

      const res = await fetch(`${API_BASE_URL}/meus-dados/atualizar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveStatus("success");
        if (urlImagemFinal) handleUpdateUserPhoto(urlImagemFinal);
        setTimeout(() => navigate("/"), 1400);
      } else {
        const err = await res.json();
        setSaveStatus({ error: err.message || "Verifique os dados informados." });
      }
    } catch {
      setSaveStatus({ error: "Erro de conexão ou no upload da imagem." });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="content">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="ep-skeleton-wrap">
            <div className="ep-skeleton ep-skeleton--avatar" />
            <div className="ep-skeleton ep-skeleton--line" />
            <div className="ep-skeleton ep-skeleton--line ep-skeleton--short" />
            <div className="ep-skeleton ep-skeleton--line" />
          </div>
        </main>
      </div>
    );
  }

  // ── Rendered fields per section ────────────────────────────────
  const sectionContent = {
    identidade: (
      <div className="ep-section-body">
        <div className="ep-row ep-row--2col">
          <InputField label="Username" name="userName" value={userData?.userName || ""} disabled />
          <InputField label="E-mail" name="email" value={userData?.email || ""} disabled />
        </div>
        <div className="ep-row ep-row--2col">
          <InputField
            label="Nome público"
            name="nomePublico"
            value={formData.nomePublico}
            onChange={handleChange}
            placeholder="Como quer ser chamado?"
          />
          <InputField
            label="Profissão"
            name="profissao"
            value={formData.profissao}
            onChange={handleChange}
            placeholder="Ex: Backend Developer"
          />
        </div>

        <label className={`ep-toggle-row ${isAnonimo ? "ep-toggle-row--active" : ""}`}>
          <div className="ep-toggle-info">
            <span className="ep-toggle-title">Modo anônimo</span>
            <span className="ep-toggle-desc">Oculta seu nome e foto para outros usuários</span>
          </div>
          <div
            className={`ep-toggle-track ${isAnonimo ? "ep-toggle-track--on" : ""}`}
            onClick={() => setIsAnonimo((v) => !v)}
            role="switch"
            aria-checked={isAnonimo}
            tabIndex={0}
            onKeyDown={(e) => e.key === " " && setIsAnonimo((v) => !v)}
          >
            <div className="ep-toggle-thumb" />
          </div>
        </label>
      </div>
    ),

    contato: (
      <div className="ep-section-body">
        <div className="ep-row ep-row--2col">
          <InputField
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="+5548999999999"
          />
          <InputField
            label="País"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            placeholder="Brasil"
          />
        </div>
        <div className="ep-row ep-row--1col">
          <InputField
            label="Cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Florianópolis"
          />
        </div>
      </div>
    ),

    links: (
      <div className="ep-section-body">
        <div className="ep-row ep-row--2col">
          <div className="ep-field ep-field--icon">
            <label className="ep-label">GitHub</label>
            <div className="ep-input-icon-wrap">
              <span className="ep-input-icon ep-input-icon--github" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.34C3.73 14.38 3.27 13 3.27 13c-.36-.92-.88-1.16-.88-1.16-.72-.49.06-.48.06-.48.8.06 1.22.82 1.22.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.67 7.67 0 018 4.58a7.67 7.67 0 012.01.27c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </span>
              <input
                className="ep-input ep-input--with-icon"
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/seu-user"
              />
            </div>
          </div>
          <div className="ep-field ep-field--icon">
            <label className="ep-label">LinkedIn</label>
            <div className="ep-input-icon-wrap">
              <span className="ep-input-icon ep-input-icon--linkedin" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 01.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </span>
              <input
                className="ep-input ep-input--with-icon"
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/seu-perfil"
              />
            </div>
          </div>
        </div>

        <div className="ep-field ep-field--full">
          <div className="ep-label-row">
            <label className="ep-label">Sobre mim</label>
            <span className={`ep-char-count ${formData.bio.length > 900 ? "ep-char-count--warn" : ""}`}>
              {formData.bio.length} / 1000
            </span>
          </div>
          <textarea
            className="ep-textarea"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={6}
            placeholder="Conte sua história, seus interesses e o que te motiva..."
            maxLength={1000}
          />
        </div>
      </div>
    ),
  };

  // ── Main render ────────────────────────────────────────────────
  return (
    <div className="content">
      <div className="sidebar-wrapper"><Sidebar /></div>

      <main className="main-content">
        <div className="ep-page">
          <form className="ep-form" onSubmit={handleSubmit} noValidate>

            {/* ── Header ── */}
            <header className="ep-header">
              <div className="ep-header-left">
                <button
                  type="button"
                  className="ep-back-btn"
                  onClick={() => navigate("/")}
                  disabled={isSaving}
                  aria-label="Voltar"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M11.5 4L6.5 9L11.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div>
                  <h1 className="ep-title">Editar perfil</h1>
                  <p className="ep-subtitle">@{userData?.userName}</p>
                </div>
              </div>

              <div className="ep-header-actions">
                <button
                  type="button"
                  className="ep-btn ep-btn--ghost"
                  onClick={() => navigate("/")}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`ep-btn ep-btn--primary ${isSaving ? "ep-btn--loading" : ""} ${saveStatus === "success" ? "ep-btn--success" : ""}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <><span className="ep-spinner" />Salvando...</>
                  ) : saveStatus === "success" ? (
                    <><span className="ep-check">✓</span> Salvo!</>
                  ) : (
                    "Salvar alterações"
                  )}
                </button>
              </div>
            </header>

            {/* ── Error banner ── */}
            {saveStatus?.error && (
              <div className="ep-banner ep-banner--error" role="alert">
                <span className="ep-banner-icon">⚠</span>
                {saveStatus.error}
              </div>
            )}

            {/* ── Body ── */}
            <div className="ep-body">

              {/* ── Avatar column ── */}
              <aside className="ep-avatar-col">
                <div
                  className={`ep-avatar-wrap ${isDraggingAvatar ? "ep-avatar-wrap--drag" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
                  onDragLeave={() => setIsDraggingAvatar(false)}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Alterar foto de perfil"
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                >
                  <img
                    ref={avatarRef}
                    src={fotoUrl}
                    alt="Foto de perfil"
                    className="ep-avatar-img"
                    onError={() => setFotoUrl(DEFAULT_IMAGE)}
                  />
                  <div className="ep-avatar-overlay">
                    <svg className="ep-camera-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Alterar foto</span>
                    {isDraggingAvatar && <span className="ep-drop-hint">Solte aqui</span>}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    style={{ display: "none" }}
                    aria-hidden="true"
                  />
                </div>

                <p className="ep-avatar-hint">JPG, PNG ou GIF · Máx 5 MB<br/>Arraste ou clique para alterar</p>

                {/* Anon badge feedback */}
                {isAnonimo && (
                  <div className="ep-anon-badge">
                    <span className="ep-anon-icon">◈</span>
                    Modo anônimo ativo
                  </div>
                )}

                {/* Section nav on desktop (sidebar) */}
                <nav className="ep-side-nav" aria-label="Seções do perfil">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`ep-side-nav-item ${activeSection === s.id ? "ep-side-nav-item--active" : ""}`}
                      onClick={() => setActiveSection(s.id)}
                    >
                      <span className="ep-side-nav-icon">{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </nav>
              </aside>

              {/* ── Form content ── */}
              <div className="ep-content">
                {/* Tabs (mobile) */}
                <div className="ep-tabs" role="tablist">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={activeSection === s.id}
                      className={`ep-tab ${activeSection === s.id ? "ep-tab--active" : ""}`}
                      onClick={() => setActiveSection(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Section heading */}
                <div className="ep-section-heading">
                  <span className="ep-section-icon">
                    {SECTIONS.find((s) => s.id === activeSection)?.icon}
                  </span>
                  <h2 className="ep-section-title">
                    {SECTIONS.find((s) => s.id === activeSection)?.label}
                  </h2>
                </div>

                {/* Animated section panel */}
                <div className="ep-panel" key={activeSection}>
                  {sectionContent[activeSection]}
                </div>
              </div>

            </div>{/* /ep-body */}

          </form>
        </div>
      </main>
    </div>
  );
}
