// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/header.css";

const Header = ({
  isAuthenticated,
  userName,
  userPhoto,
  handleLogout,
  openAuthModal,
  openEditProfile,
  userRole,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const drawerRef = useRef(null);

  const isHomePage = location.pathname === "/";
  const isAdminMaster = isAuthenticated && userRole === "ADMIN3";

  const defaultAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  const avatarImage = userPhoto || defaultAvatar;

  /* ── Scroll detection ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active section via IntersectionObserver ── */
  useEffect(() => {
    if (!isHomePage) return;
    const sections = ["about", "skills", "projects", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [isHomePage]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Close drawer on outside click ── */
  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMenuOpen]);

  /* ── Lock body scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const go = (path) => { navigate(path); setIsMenuOpen(false); };

  const scrollTo = (id) => {
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const initials = userName
    ? userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  /* ── Nav links data ── */
  const homeLinks = [
    { id: "about", label: "Sobre" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projetos" },
    { id: "contact", label: "Contato" },
  ];

  return (
    <>
      {/* ── BACKDROP (mobile drawer) ── */}
      <div
        className={`hdr-backdrop ${isMenuOpen ? "hdr-backdrop--visible" : ""}`}
        aria-hidden="true"
      />

      <header className={`hdr ${isScrolled ? "hdr--scrolled" : ""}`} role="banner">
        {/* Thin accent line top */}
        <div className="hdr-accent-line" />

        <div className="hdr-inner">

          {/* ══ LOGO ══ */}
          <button className="hdr-logo" onClick={() => go("/")} aria-label="Ir para home">
            <span className="hdr-logo-bracket">&lt;</span>
            <span className="hdr-logo-name">Bruno</span>
            <span className="hdr-logo-dot">.</span>
            <span className="hdr-logo-role">dev</span>
            <span className="hdr-logo-bracket">/&gt;</span>
          </button>

          {/* ══ DESKTOP NAV ══ */}
          <nav className="hdr-nav" aria-label="Navegação principal">
            <button
              className={`hdr-navlink ${location.pathname === "/" && !activeSection ? "hdr-navlink--active" : ""}`}
              onClick={() => go("/")}
            >
              Home
            </button>
            <button
              className={`hdr-navlink ${location.pathname === "/artigos" ? "hdr-navlink--active" : ""}`}
              onClick={() => go("/artigos")}
            >
              Artigos
            </button>

            {isHomePage && (
              <>
                <span className="hdr-nav-divider" aria-hidden="true" />
                {homeLinks.map((link) => (
                  <button
                    key={link.id}
                    className={`hdr-navlink hdr-navlink--section ${activeSection === link.id ? "hdr-navlink--active" : ""}`}
                    onClick={() => scrollTo(link.id)}
                  >
                    {link.label}
                  </button>
                ))}
              </>
            )}
          </nav>

          {/* ══ RIGHT ACTIONS ══ */}
          <div className="hdr-actions">

            {/* Admin badge */}
            {isAdminMaster && (
              <button
                className="hdr-admin-btn"
                onClick={() => { navigate("/admin"); }}
                aria-label="Painel administrativo"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Admin
              </button>
            )}

            {/* Authenticated user */}
            {isAuthenticated && userName ? (
              <div className="hdr-user" ref={dropdownRef}>
                <button
                  className={`hdr-user-btn ${isUserMenuOpen ? "hdr-user-btn--open" : ""}`}
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Menu do usuário"
                >
                  {userPhoto ? (
                    <img src={avatarImage} alt={userName} className="hdr-avatar" />
                  ) : (
                    <div className="hdr-avatar hdr-avatar--initials">{initials}</div>
                  )}
                  <span className="hdr-user-name">{userName.split(" ")[0]}</span>
                  <svg
                    className={`hdr-chevron ${isUserMenuOpen ? "hdr-chevron--up" : ""}`}
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="hdr-dropdown" role="menu">
                    <div className="hdr-dropdown-user">
                      {userPhoto ? (
                        <img src={avatarImage} alt={userName} className="hdr-dropdown-avatar" />
                      ) : (
                        <div className="hdr-dropdown-avatar hdr-avatar--initials">{initials}</div>
                      )}
                      <div>
                        <span className="hdr-dropdown-name">{userName}</span>
                        <span className="hdr-dropdown-role">{userRole || "Membro"}</span>
                      </div>
                    </div>
                    <div className="hdr-dropdown-sep" />
                    <button
                      className="hdr-dropdown-item"
                      role="menuitem"
                      onClick={() => { openEditProfile(); setIsUserMenuOpen(false); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      Editar Perfil
                    </button>
                    <button
                      className="hdr-dropdown-item hdr-dropdown-item--danger"
                      role="menuitem"
                      onClick={() => {
                        handleLogout(); // Limpa a sessão
                        setIsUserMenuOpen(false); // Fecha o balão
                        navigate("/"); // 👈 Volta pra Home. Correto!
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login button */
              <button className="hdr-login-btn" onClick={openAuthModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Entrar
              </button>
            )}

            {/* Hamburger */}
            <button
              className={`hdr-hamburger ${isMenuOpen ? "hdr-hamburger--open" : ""}`}
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ══ MOBILE DRAWER ══ */}
      <nav
        ref={drawerRef}
        className={`hdr-drawer ${isMenuOpen ? "hdr-drawer--open" : ""}`}
        aria-label="Menu mobile"
        aria-hidden={!isMenuOpen}
      >
        {/* Drawer header */}
        <div className="hdr-drawer-head">
          <div className="hdr-drawer-logo">
            <span className="hdr-logo-bracket">&lt;</span>
            <span className="hdr-logo-name">Bruno</span>
            <span className="hdr-logo-dot">.</span>
            <span className="hdr-logo-role">dev</span>
            <span className="hdr-logo-bracket">/&gt;</span>
          </div>
          <button
            className="hdr-drawer-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* User block (if authenticated) */}
        {isAuthenticated && userName && (
          <div className="hdr-drawer-user">
            {userPhoto
              ? <img src={avatarImage} alt={userName} className="hdr-drawer-avatar" />
              : <div className="hdr-drawer-avatar hdr-avatar--initials">{initials}</div>
            }
            <div>
              <span className="hdr-drawer-uname">{userName}</span>
              <span className="hdr-drawer-urole">{userRole || "Membro"}</span>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="hdr-drawer-links">
          <p className="hdr-drawer-section-label">Navegação</p>
          <button className="hdr-drawer-link" onClick={() => go("/")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            Home
          </button>
          <button className="hdr-drawer-link" onClick={() => go("/artigos")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            Artigos
          </button>

          {isHomePage && (
            <>
              <p className="hdr-drawer-section-label" style={{ marginTop: 20 }}>Seções</p>
              {homeLinks.map((link) => (
                <button
                  key={link.id}
                  className={`hdr-drawer-link ${activeSection === link.id ? "hdr-drawer-link--active" : ""}`}
                  onClick={() => scrollTo(link.id)}
                >
                  <span className="hdr-drawer-link-dot" />
                  {link.label}
                </button>
              ))}
            </>
          )}

          {isAdminMaster && (
            <>
              <p className="hdr-drawer-section-label" style={{ marginTop: 20 }}>Admin</p>
              <button className="hdr-drawer-link hdr-drawer-link--admin" onClick={() => go("/admin")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Painel Admin
              </button>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="hdr-drawer-footer">
          {isAuthenticated && userName ? (
            <>
              <button className="hdr-drawer-action" onClick={() => { openEditProfile(); setIsMenuOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Editar Perfil
              </button>
              <button
                className="hdr-drawer-action hdr-drawer-action--danger"
                onClick={() => {
                  handleLogout(); // Limpa a sessão
                  setIsMenuOpen(false); // Fecha a gaveta lateral
                  navigate("/"); // 👈 Volta pra Home. Correto!
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sair da conta
              </button>
            </>
          ) : (
            <button className="hdr-drawer-action hdr-drawer-action--primary" onClick={() => { openAuthModal(); setIsMenuOpen(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
              Entrar / Cadastrar
            </button>
          )}
          <span className="hdr-drawer-copy">© 2026 BrunoFraga.dev</span>
        </div>
      </nav>
    </>
  );
};

export default Header;
