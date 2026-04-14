/**
 * Ferramenta de monitoramento de logs do sistema para o painel admin.
 * Consome: GET /paineladm/logs?page=0&size=20
 * Design: Tech-Noir dark com paleta verde #48bb78 / #4caf50
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../styles/systemlogs.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// ─── Ícones SVG inline ────────────────────────────────────────────────────────

const Icon = ({ d, size = 18, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {[d].flat().map((path, i) => <path key={i} d={path} />)}
  </svg>
);

const Icons = {
  AlertTriangle: () => <Icon d={["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"]} />,
  Activity:      () => <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  RefreshCw:     () => <Icon d={["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"]} />,
  ChevronLeft:   () => <Icon d="M15 18l-6-6 6-6" />,
  ChevronRight:  () => <Icon d="M9 18l6-6-6-6" />,
  ChevronDown:   () => <Icon d="M6 9l6 6 6-6" />,
  ChevronUp:     () => <Icon d="M18 15l-6-6-6 6" />,
  Search:        () => <Icon d={["M11 17a6 6 0 100-12 6 6 0 000 12z","M21 21l-4.35-4.35"]} />,
  X:             () => <Icon d={["M18 6L6 18","M6 6l12 12"]} />,
  Clock:         () => <Icon d={["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 6v6l4 2"]} />,
  Terminal:      () => <Icon d={["M4 17l6-6-6-6","M12 19h8"]} />,
  Zap:           () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  Shield:        () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  Eye:           () => <Icon d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"]} />,
  Filter:        () => <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  Download:      () => <Icon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} />,
  Hash:          () => <Icon d={["M4 9h16","M4 15h16","M10 3L8 21","M16 3l-2 18"]} />,
  Cpu:           () => <Icon d={["M12 20h9","M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z","M9 9h1","M14 9h1","M9 14h1","M14 14h1","M5 9H3","M5 14H3","M19 9h2","M19 14h2","M9 19v2","M14 19v2","M9 5V3","M14 5V3"]} />,
  BarChart2:     () => <Icon d={["M18 20V10","M12 20V4","M6 20v-6"]} />,
  Info:          () => <Icon d={["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 8h.01","M11 12h1v4h1"]} />,
  Loader:        () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" className="sl-spin">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  WifiOff:       () => <Icon d={["M1 1l22 22","M16.72 11.06A10.94 10.94 0 0119 12.55","M5 12.55a10.94 10.94 0 015.17-2.39","M10.71 5.05A16 16 0 0122.56 9","M1.42 9a15.91 15.91 0 014.7-2.88","M8.53 16.11a6 6 0 016.95 0","M12 20h.01"]} />,
};

// ─── Utilitários ──────────────────────────────────────────────────────────────

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "—", time: "—", full: "—" };
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    full: d.toLocaleString("pt-BR"),
  };
};

const getErrorCategory = (message = "", stackTrace = "") => {
  const text = (message + stackTrace).toLowerCase();
  if (text.includes("nullpointer") || text.includes("null"))           return { label: "NullPointer",     color: "red",    icon: "zap" };
  if (text.includes("database") || text.includes("sql") || text.includes("jdbc")) return { label: "Database",  color: "orange", icon: "cpu" };
  if (text.includes("auth") || text.includes("token") || text.includes("403") || text.includes("401")) return { label: "Auth", color: "yellow", icon: "shield" };
  if (text.includes("timeout") || text.includes("connection"))         return { label: "Timeout",         color: "orange", icon: "wifi" };
  if (text.includes("notfound") || text.includes("404"))               return { label: "Not Found",       color: "blue",   icon: "search" };
  return { label: "Runtime",                                                       color: "red",    icon: "terminal" };
};

const truncate = (str, max = 80) => {
  if (!str) return "—";
  return str.length > max ? str.slice(0, max) + "…" : str;
};

// ─── Componente: MiniSparkline (SVG inline) ───────────────────────────────────

const Sparkline = ({ data = [], color = "#48bb78", width = 80, height = 28 }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(" ");

  const area = `0,${height} ${pts} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sl-sparkline">
      <defs>
        <linearGradient id={`spark-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Componente: DonutChart ───────────────────────────────────────────────────

const DonutChart = ({ segments = [], size = 100, thickness = 16 }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  const paths = segments.map((seg, i) => {
    const dash = (seg.value / total) * circ;
    const gap = circ - dash;
    const el = (
      <circle key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)" }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
      {paths}
    </svg>
  );
};

// ─── Componente: StatCard ─────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color = "green", sparkData }) => (
  <div className={`sl-stat-card sl-stat-card--${color}`}>
    <div className="sl-stat-card__header">
      <div className={`sl-stat-card__icon sl-stat-card__icon--${color}`}>{icon}</div>
      <span className="sl-stat-card__label">{label}</span>
    </div>
    <div className="sl-stat-card__value">{value}</div>
    {sub && <div className="sl-stat-card__sub">{sub}</div>}
    {sparkData && <Sparkline data={sparkData} color={color === "green" ? "#48bb78" : color === "red" ? "#f87171" : color === "orange" ? "#fb923c" : "#60a5fa"} />}
  </div>
);

// ─── Componente: StackTrace Viewer ────────────────────────────────────────────

const StackTraceModal = ({ log, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!log) return null;
  const dt = formatDateTime(log.timestamp || log.createdAt);
  const cat = getErrorCategory(log.message, log.stackTrace);

  const lines = (log.stackTraceCompleta || log.stackTraceCompleta || "Sem stack trace disponível")
    .split("\n")
    .filter(Boolean);

  return (
    <div className="sl-modal-backdrop" onClick={onClose}>
      <div className="sl-modal" ref={ref} onClick={e => e.stopPropagation()}>

        <div className="sl-modal__header">
          <div className="sl-modal__header-left">
            <span className={`sl-badge sl-badge--${cat.color}`}>{cat.label}</span>
            <span className="sl-modal__id">#{log.id}</span>
          </div>
          <button className="sl-modal__close" onClick={onClose}><Icons.X /></button>
        </div>

        <div className="sl-modal__meta">
          <div className="sl-modal__meta-item">
            <Icons.Clock />
            <span>{dt.full}</span>
          </div>
          {log.endpoint && (
            <div className="sl-modal__meta-item">
              <Icons.Hash />
              <span>{log.endpoint}</span>
            </div>
          )}
          {log.httpMethod && (
            <div className="sl-modal__meta-item">
              <Icons.Activity />
              <span>{log.httpMethod}</span>
            </div>
          )}
        </div>

        {log.message && (
          <div className="sl-modal__message">
            <div className="sl-modal__section-label">Mensagem de Erro</div>
            <p className="sl-modal__message-text">{log.message}</p>
          </div>
        )}

        <div className="sl-modal__trace">
          <div className="sl-modal__section-label" style={{ marginBottom: 10 }}>
            Stack Trace
            <span className="sl-modal__line-count">{lines.length} linhas</span>
          </div>
          <div className="sl-modal__trace-body">
            {lines.map((line, i) => {
              const isCause = line.trim().startsWith("Caused by:");
              const isAt    = line.trim().startsWith("at ");
              const isTitle = i === 0 && !isAt;
              return (
                <div key={i} className={`sl-trace-line ${isCause ? "sl-trace-line--cause" : ""} ${isAt ? "sl-trace-line--at" : ""} ${isTitle ? "sl-trace-line--title" : ""}`}>
                  <span className="sl-trace-line__num">{i + 1}</span>
                  <span className="sl-trace-line__text">{line}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Componente principal: SystemLogs ─────────────────────────────────────────

export default function SystemLogs() {
  const [logs,          setLogs]          = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [page,          setPage]          = useState(0);
  const [size]                            = useState(20);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("all");
  const [selectedLog,   setSelectedLog]   = useState(null);
  const [autoRefresh,   setAutoRefresh]   = useState(false);
  const intervalRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (pg = 0) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/paineladm/logs?page=${pg}&size=${size}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Suporta diferentes formatos de resposta da API
      const content   = data.content || data.dados || data.logs || [];
      const total     = data.totalElements || data.total || content.length;
      const pages     = data.totalPages    || Math.ceil(total / size) || 1;

      setLogs(content);
      setTotalElements(total);
      setTotalPages(pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => { fetchLogs(page); }, [page, fetchLogs]);

  // ── Auto-refresh ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchLogs(page), 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, page, fetchLogs]);

  // ── Estatísticas derivadas ─────────────────────────────────────────────────
  const stats = React.useMemo(() => {
    const total   = logs.length;
    const byHour  = Array(8).fill(0).map((_, i) => Math.floor(Math.random() * 10)); // demo visual
    const cats    = {};
    logs.forEach(log => {
      const c = getErrorCategory(log.message, log.stackTrace).label;
      cats[c] = (cats[c] || 0) + 1;
    });
    const recent = logs.slice(0, 5).length;
    return { total, byHour, cats, recent };
  }, [logs]);

  const donutSegments = Object.entries(stats.cats).map(([label, value]) => {
    const colors = { NullPointer: "#f87171", Database: "#fb923c", Auth: "#fbbf24", Timeout: "#fb923c", "Not Found": "#60a5fa", Runtime: "#f87171" };
    return { label, value, color: colors[label] || "#9ca3af" };
  });

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return logs.filter(log => {
      const matchSearch = !search ||
        (log.message || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.stackTrace || "").toLowerCase().includes(search.toLowerCase()) ||
        String(log.id).includes(search);
      const cat = getErrorCategory(log.message, log.stackTrace).label;
      const matchCat = filterCat === "all" || cat === filterCat;
      return matchSearch && matchCat;
    });
  }, [logs, search, filterCat]);

  const categories = ["all", ...new Set(logs.map(l => getErrorCategory(l.message, l.stackTrace).label))];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sl-root">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sl-header">
        <div className="sl-header__left">
          <div className="sl-header__icon-wrap">
            <Icons.Terminal />
          </div>
          <div>
            <h1 className="sl-header__title">System Logs</h1>
            <p className="sl-header__sub">Monitoramento e auditoria de erros do servidor</p>
          </div>
        </div>
        <div className="sl-header__right">
          <button
            className={`sl-btn sl-btn--ghost ${autoRefresh ? "sl-btn--active" : ""}`}
            onClick={() => setAutoRefresh(v => !v)}
            title="Auto-refresh a cada 15s"
          >
            <span className={`sl-pulse-dot ${autoRefresh ? "sl-pulse-dot--live" : ""}`} />
            {autoRefresh ? "Live" : "Estático"}
          </button>
          <button className="sl-btn sl-btn--refresh"
            onClick={() => fetchLogs(page)} disabled={loading}>
            <span className={loading ? "sl-spin" : ""}><Icons.RefreshCw /></span>
            Atualizar
          </button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="sl-stats-grid">
        <StatCard
          icon={<Icons.AlertTriangle />}
          label="Total de Erros"
          value={totalElements.toLocaleString()}
          sub={`${stats.total} nesta página`}
          color="red"
          sparkData={stats.byHour}
        />
        <StatCard
          icon={<Icons.Zap />}
          label="Recentes"
          value={stats.recent}
          sub="últimos 5 registros"
          color="orange"
          sparkData={[2,5,3,8,6,9,4,7]}
        />
        <StatCard
          icon={<Icons.BarChart2 />}
          label="Página Atual"
          value={`${page + 1} / ${totalPages}`}
          sub={`${size} registros por página`}
          color="blue"
        />
        <StatCard
          icon={<Icons.Shield />}
          label="Categorias"
          value={Object.keys(stats.cats).length || "—"}
          sub="tipos detectados"
          color="green"
        />
      </div>

      {/* ── Chart + Table Grid ─────────────────────────────────────────────── */}
      <div className="sl-content-grid">

        {/* Donut Distribution */}
        <div className="sl-panel sl-panel--chart">
          <div className="sl-panel__header">
            <Icons.Activity />
            <span>Distribuição de Erros</span>
          </div>
          <div className="sl-donut-wrap">
            <DonutChart segments={donutSegments.length ? donutSegments : [{ value: 1, color: "rgba(255,255,255,0.08)" }]} size={120} thickness={18} />
            <div className="sl-donut-center">
              <span className="sl-donut-center__num">{stats.total}</span>
              <span className="sl-donut-center__label">erros</span>
            </div>
          </div>
          <div className="sl-donut-legend">
            {donutSegments.map((seg, i) => (
              <div key={i} className="sl-legend-item">
                <span className="sl-legend-dot" style={{ background: seg.color }} />
                <span className="sl-legend-label">{seg.label}</span>
                <span className="sl-legend-val">{seg.value}</span>
              </div>
            ))}
            {!donutSegments.length && (
              <p className="sl-empty-legend">Sem dados para exibir</p>
            )}
          </div>
        </div>

        {/* Main Log Table */}
        <div className="sl-panel sl-panel--table">
          <div className="sl-panel__header">
            <Icons.Terminal />
            <span>Registros de Erro</span>
            <div className="sl-panel__tools">
              {/* Search */}
              <div className="sl-search-wrap">
                <Icons.Search />
                <input
                  className="sl-search-input"
                  placeholder="Buscar no stack trace..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="sl-search-clear" onClick={() => setSearch("")}>
                    <Icons.X />
                  </button>
                )}
              </div>

              {/* Filter */}
              <div className="sl-filter-wrap">
                <Icons.Filter />
                <select
                  className="sl-filter-select"
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === "all" ? "Todas as categorias" : c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="sl-loading">
              <Icons.Loader />
              <span>Carregando logs do servidor…</span>
            </div>
          ) : error ? (
            <div className="sl-error">
              <Icons.WifiOff />
              <span>Erro ao carregar: {error}</span>
              <button className="sl-btn sl-btn--ghost" onClick={() => fetchLogs(page)}>Tentar novamente</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="sl-empty">
              <Icons.Info />
              <span>{search || filterCat !== "all" ? "Nenhum log encontrado com este filtro." : "Nenhum log registrado."}</span>
            </div>
          ) : (
            <div className="sl-table-wrap">
              <table className="sl-table">
                <thead>
                  <tr>
                    <th className="sl-th sl-th--id">#</th>
                    <th className="sl-th sl-th--cat">Categoria</th>
                    <th className="sl-th sl-th--msg">Mensagem / Stack</th>
                    <th className="sl-th sl-th--time">Timestamp</th>
                    <th className="sl-th sl-th--action"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, idx) => {
                    const dt  = formatDateTime(log.dataHora || log.dataHora);
                    const cat = getErrorCategory(log.mensagemResumo, log.stackTraceCompleta);
                    const msg = log.message || log.mensagemResumo || "Sem mensagem";
                    return (
                      <tr key={log.id || idx}
                        className={`sl-tr sl-tr--${cat.color}`}
                        onClick={() => setSelectedLog(log)}>
                        <td className="sl-td sl-td--id">
                          <span className="sl-id-badge">{log.id || idx + 1}</span>
                        </td>
                        <td className="sl-td sl-td--cat">
                          <span className={`sl-badge sl-badge--${cat.color}`}>
                            {cat.label}
                          </span>
                        </td>
                        <td className="sl-td sl-td--msg">
                          <span className="sl-msg-text">{truncate(msg, 90)}</span>
                        </td>
                        <td className="sl-td sl-td--time">
                          <div className="sl-time-block">
                            <span className="sl-time-date">{dt.date}</span>
                            <span className="sl-time-time">{dt.time}</span>
                          </div>
                        </td>
                        <td className="sl-td sl-td--action">
                          <button className="sl-view-btn" onClick={e => { e.stopPropagation(); setSelectedLog(log); }}>
                            <Icons.Eye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="sl-pagination">
              <span className="sl-pagination__info">
                {totalElements.toLocaleString()} registros · página {page + 1} de {totalPages}
              </span>
              <div className="sl-pagination__controls">
                <button
                  className="sl-page-btn"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}>
                  <Icons.ChevronLeft />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pg = Math.min(Math.max(0, page - 2) + i, totalPages - 1);
                  return (
                    <button key={pg}
                      className={`sl-page-btn ${pg === page ? "sl-page-btn--active" : ""}`}
                      onClick={() => setPage(pg)}>
                      {pg + 1}
                    </button>
                  );
                })}
                <button
                  className="sl-page-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
                  <Icons.ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stack Trace Modal ───────────────────────────────────────────────── */}
      {selectedLog && (
        <StackTraceModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
