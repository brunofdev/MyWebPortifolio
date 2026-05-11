import { useState, useEffect, useRef, useCallback } from "react";
import "../../styles/githubactivity.css";

const GITHUB_USERNAME = "brunofdev";
const POLL_INTERVAL   = 5 * 60 * 1000;
const SCROLL_SPEED    = 0.5;

const EVENT_CONFIG = {
  CommitEvent:            { icon: "ti-git-commit",       label: "Commit",  cls: "commit"  },
  PullRequestEvent:       { icon: "ti-git-pull-request", label: "PR",      cls: "pr"      },
  CreateEvent:            { icon: "ti-git-branch",       label: "Create",  cls: "create"  },
  IssuesEvent:            { icon: "ti-circle-dot",       label: "Issue",   cls: "issue"   },
  ReleaseEvent:           { icon: "ti-package",          label: "Release", cls: "release" },
  PullRequestReviewEvent: { icon: "ti-check",            label: "Review",  cls: "review"  },
};

const TYPE_COLORS = {
  commit: {
    accent: "#3FB950",
    bg: "rgba(63, 185, 80, 0.10)",
    text: "#7EE787",
    border: "rgba(63, 185, 80, 0.22)",
  },

  pr: {
    accent: "#2F81F7",
    bg: "rgba(47, 129, 247, 0.10)",
    text: "#A5D6FF",
    border: "rgba(47, 129, 247, 0.22)",
  },

  create: {
    accent: "#D29922",
    bg: "rgba(210, 153, 34, 0.10)",
    text: "#F2CC60",
    border: "rgba(210, 153, 34, 0.22)",
  },

  issue: {
    accent: "#F85149",
    bg: "rgba(248, 81, 73, 0.10)",
    text: "#FFABA8",
    border: "rgba(248, 81, 73, 0.22)",
  },

  release: {
    accent: "#C9D1D9",
    bg: "rgba(201, 209, 217, 0.06)",
    text: "#F0F6FC",
    border: "rgba(201, 209, 217, 0.16)",
  },

  review: {
    accent: "#1F9CF0",
    bg: "rgba(31, 156, 240, 0.10)",
    text: "#C2E7FF",
    border: "rgba(31, 156, 240, 0.22)",
  },
};
/* ── Helpers ─────────────────────────────────────────── */
function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60)    return `${s}s`;
  if (s < 3600)  return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function parseTicket(msg = "") {
  const m = msg.match(/^((?:[A-Z]+-\d+)(?:\/[A-Z]+-\d+)*):\s*([\s\S]+)/);
  return m ? { tickets: m[1].split("/"), body: m[2].trim() } : { tickets: [], body: msg.trim() };
}

function getEventUrl(event) {
  const base = `https://github.com/${event.repo.name}`;
  const p    = event.payload;
  switch (event.type) {
    case "PullRequestEvent":       return p?.pull_request?.html_url || base;
    case "IssuesEvent":            return p?.issue?.html_url || base;
    case "IssueCommentEvent":      return p?.comment?.html_url || base;
    case "ReleaseEvent":           return p?.release?.html_url || base;
    case "PullRequestReviewEvent": return p?.pull_request?.html_url || base;
    default:                       return base;
  }
}

/* ── Hooks ───────────────────────────────────────────── */

// Fetches full commit data when the GitHub API omits it from PushEvent
function useCommitDetails(commitData) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!commitData?.apiUrl) return;

    const isOmitted =
      commitData.message?.startsWith("Commit ") &&
      commitData.message?.includes("(Detalhes omitidos");

    if (!isOmitted) {
      setDetails(commitData);
      return;
    }

    setLoading(true);
    fetch(commitData.apiUrl)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setDetails({
          ...commitData,
          message: data.commit?.message?.split("\n")[0] || commitData.message,
          stats: data.stats
            ? { add: data.stats.additions, del: data.stats.deletions, files: data.files?.length || 0 }
            : null,
        });
      })
      .catch(() => setDetails(commitData))
      .finally(() => setLoading(false));
  }, [commitData?.apiUrl]);

  return { details: details || commitData, loading };
}

// Fetches diff stats for commits that already have their message
function useCommitStats(apiUrl, skip) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!apiUrl || skip) return;
    fetch(apiUrl)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (data.stats)
          setStats({ add: data.stats.additions, del: data.stats.deletions, files: data.files?.length || 0 });
      })
      .catch(() => {});
  }, [apiUrl]);

  return stats;
}

/* ── Sub-components ──────────────────────────────────── */

function SkeletonRow() {
  return (
    <div className="gh-skeleton">
      <div className="gh-skeleton-line" style={{ width: "55%", animationDelay: "0s" }} />
      <div className="gh-skeleton-line" style={{ width: "80%", animationDelay: "0.1s" }} />
    </div>
  );
}

function Tickets({ tickets }) {
  if (!tickets?.length) return null;
  return (
    <span className="gh-tickets">
      {tickets.map(t => <span key={t} className="gh-ticket">{t}</span>)}
    </span>
  );
}

function CommitRow({ event }) {
  const cfg = EVENT_CONFIG["CommitEvent"];
  const c   = event.commitData;
  const col = TYPE_COLORS["commit"];

  const { details, loading } = useCommitDetails(c);

  const isOmitted  = c.message?.startsWith("Commit ") && c.message?.includes("(Detalhes omitidos");
  const extraStats = useCommitStats(c.apiUrl, isOmitted || loading);
  const finalStats = details.stats || extraStats;

  const { tickets, body } = parseTicket(details.message || c.message);
  const repoUrl = `https://github.com/${event.repo.name}`;
  const repo    = event.repo?.name?.split("/")[1] || "repo";

  return (
    <div className="gh-row">
      <div className="gh-row-accent" style={{ background: col.accent }} />
      <div className="gh-row-top">
        <span className="gh-type-icon" style={{ background: col.bg }}>
          <i className={`ti ${cfg.icon}`} style={{ color: col.accent }} />
        </span>
        <span className="gh-badge" style={{ color: col.text, borderColor: col.border, background: col.bg }}>
          {cfg.label}
        </span>
        <a href={repoUrl} target="_blank" rel="noreferrer" className="gh-repo">{repo}</a>
        {c.branch && (
          <>
            <span className="gh-sep">›</span>
            <a href={`${repoUrl}/tree/${c.branch}`} target="_blank" rel="noreferrer" className="gh-branch">
              <i className="ti ti-git-branch" />
              {c.branch}
            </a>
          </>
        )}
        <span className="gh-time">{timeAgo(event.created_at)}</span>
      </div>

      <div className="gh-commit-body">
        <div className="gh-commit-msg">
          <Tickets tickets={tickets} />
          <a
            href={c.html_url} target="_blank" rel="noreferrer"
            className={`gh-commit-title${loading ? " loading" : ""}`}
          >
            {loading ? "Loading commit message…" : body}
          </a>
        </div>
        <div className="gh-commit-meta">
          <a href={c.html_url} target="_blank" rel="noreferrer" className="gh-sha">
            <i className="ti ti-hash" />
            {c.sha}
          </a>
          {finalStats ? (
            <div className="gh-stats">
              {finalStats.files > 0 && (
                <span className="gh-stat-files">
                  <i className="ti ti-file" style={{ fontSize: "9px" }} /> {finalStats.files}
                </span>
              )}
              {finalStats.add > 0 && <span className="gh-stat-add">+{finalStats.add}</span>}
              {finalStats.del > 0 && <span className="gh-stat-del">-{finalStats.del}</span>}
            </div>
          ) : (
            !loading && <span className="gh-stats-loading">···</span>
          )}
        </div>
      </div>
    </div>
  );
}

function PRRow({ event }) {
  const cfg  = EVENT_CONFIG["PullRequestEvent"];
  const p    = event.payload;
  const col  = TYPE_COLORS["pr"];
  const repo = event.repo?.name?.split("/")[1] || "repo";
  const url  = getEventUrl(event);

  // Criamos um estado para guardar os detalhes completos do PR
  const [prDetails, setPrDetails] = useState(p?.pull_request);
  const [loading, setLoading] = useState(!p?.pull_request?.title);

  // Efeito que vai no GitHub buscar o título se ele vier em branco
  useEffect(() => {
    const prApiUrl = p?.pull_request?.url;
    if (p?.pull_request?.title || !prApiUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(prApiUrl)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setPrDetails(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [p?.pull_request?.title, p?.pull_request?.url]);

  const merged = prDetails?.merged ?? p?.pull_request?.merged;
  const action = merged ? "merged" : (p?.action || "updated");
  
  // Extraímos o título, ou usamos um fallback temporário
  const { tickets, body } = parseTicket(prDetails?.title || `Pull Request #${p?.pull_request?.number}`);

  const badgeColor = merged
    ? { color: "#bc8cff", border: "rgba(188,140,255,0.3)", bg: "rgba(188,140,255,0.08)" }
    : action === "closed"
    ? { color: "#f85149", border: "rgba(248,81,73,0.3)",   bg: "rgba(248,81,73,0.08)"   }
    : col;

  return (
    <div className="gh-row">
      <div className="gh-row-accent" style={{ background: col.accent }} />
      <div className="gh-row-top">
        <span className="gh-type-icon" style={{ background: col.bg }}>
          <i className={`ti ${cfg.icon}`} style={{ color: col.accent }} />
        </span>
        <span className="gh-badge" style={{ color: badgeColor.color, borderColor: badgeColor.border, background: badgeColor.bg }}>
          {merged ? "Merged" : action}
        </span>
        <a href={`https://github.com/${event.repo.name}`} target="_blank" rel="noreferrer" className="gh-repo">
          {repo}
        </a>
        <span className="gh-pr-num">#{p?.pull_request?.number}</span>
        <span className="gh-time">{timeAgo(event.created_at)}</span>
      </div>
      <div className="gh-pr-body">
        <div style={{ display: "flex", alignItems: "baseline", gap: "7px", flexWrap: "wrap" }}>
          <Tickets tickets={tickets} />
          <a href={url} target="_blank" rel="noreferrer" className={`gh-pr-link${loading ? " loading" : ""}`}>
            {loading ? "Carregando título..." : body}
          </a>
        </div>
      </div>
    </div>
  );
}

function GenericRow({ event }) {
  const cfg = EVENT_CONFIG[event.type];
  if (!cfg) return null;

  const col  = TYPE_COLORS[cfg.cls] || TYPE_COLORS.commit;
  const p    = event.payload;
  const repo = event.repo?.name?.split("/")[1] || "repo";

  const genericText = {
    CreateEvent:            `new ${p?.ref_type}: ${p?.ref || repo}`,
    DeleteEvent:            `deleted ${p?.ref_type}: ${p?.ref || ""}`,
    WatchEvent:             "starred this repository",
    ForkEvent:              `forked → ${p?.forkee?.full_name || repo}`,
    ReleaseEvent:           `${p?.action}: ${p?.release?.name || p?.release?.tag_name || ""}`,
    IssuesEvent:            `${p?.action}: ${(p?.issue?.title || "").slice(0, 80)}`,
    IssueCommentEvent:      (p?.comment?.body || "").slice(0, 90),
    PullRequestReviewEvent: (() => {
      const state   = p?.review?.state?.toLowerCase();
      const prTitle = (p?.pull_request?.title || "").slice(0, 60);
      // Evita o traço solto se o título for cortado pela API
      return `${state || "reviewed"} ${prTitle ? "— " + prTitle : ""}`;
    })(),
  }[event.type] || event.type;

  const reviewState = event.type === "PullRequestReviewEvent"
    ? p?.review?.state?.toLowerCase()
    : null;

  return (
    <div className="gh-row">
      <div className="gh-row-accent" style={{ background: col.accent }} />
      <div className="gh-row-top">
        <span className="gh-type-icon" style={{ background: col.bg }}>
          <i className={`ti ${cfg.icon}`} style={{ color: col.accent }} />
        </span>
        <span className="gh-badge" style={{ color: col.text, borderColor: col.border, background: col.bg }}>
          {cfg.label}
        </span>
        <a href={`https://github.com/${event.repo.name}`} target="_blank" rel="noreferrer" className="gh-repo">
          {repo}
        </a>
        <span className="gh-sep">›</span>
        {reviewState && (
          <span className={`gh-review-state gh-review-state--${reviewState}`}>
            {reviewState.replace("_", " ")}
          </span>
        )}
        <span className="gh-generic-text">{genericText}</span>
        <span className="gh-time">{timeAgo(event.created_at)}</span>
      </div>
    </div>
  );
}

function EventRow({ event }) {
  if (event.type === "CommitEvent")      return <CommitRow event={event} />;
  if (event.type === "PullRequestEvent") return <PRRow     event={event} />;
  return <GenericRow event={event} />;
}

/* ── Main component ──────────────────────────────────── */
export default function GitHubTicker() {
  const [events,        setEvents]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [paused,        setPaused]        = useState(false);
  const [lastSync,      setLastSync]      = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const viewRef     = useRef(null);
  const animRef     = useRef(null);
  const exactScroll = useRef(0);
  const pausedRef   = useRef(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const fetchEvents = useCallback(() => {
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`)
      .then(r => { if (!r.ok) throw new Error(`GitHub ${r.status}`); return r.json(); })
      .then(data => {
        const allowed = Object.keys(EVENT_CONFIG);

        const flattened = data.flatMap(e => {
          if (e.type === "PushEvent") {
            const branch  = e.payload?.ref?.replace("refs/heads/", "") || "main";
            const commits = e.payload.commits;

            if (commits && commits.length > 0) {
              return commits.map(c => ({
                id:         c.sha,
                type:       "CommitEvent",
                repo:       e.repo,
                created_at: e.created_at,
                commitData: {
                  sha:      c.sha.slice(0, 7),
                  message:  c.message?.split("\n")[0] || "",
                  apiUrl:   c.url,
                  html_url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
                  branch,
                },
              }));
            }

            if (e.payload.head) {
              const headSha = e.payload.head;
              return [{
                id:         headSha,
                type:       "CommitEvent",
                repo:       e.repo,
                created_at: e.created_at,
                commitData: {
                  sha:      headSha.slice(0, 7),
                  // Placeholder — useCommitDetails will replace this automatically
                  message:  `Commit ${headSha.slice(0, 7)} (Detalhes omitidos pela API)`,
                  apiUrl:   `https://api.github.com/repos/${e.repo.name}/commits/${headSha}`,
                  html_url: `https://github.com/${e.repo.name}/commit/${headSha}`,
                  branch,
                },
              }];
            }
          }

          return allowed.includes(e.type) ? [e] : [];
        });

        setEvents(flattened);
        setLoading(false);
        setLastSync(new Date());
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const toggleFilter = (type) =>
    setActiveFilters(prev =>
      prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );

  const filteredEvents = events.filter(e =>
    activeFilters.length === 0 || activeFilters.includes(e.type)
  );
  const doubled = filteredEvents.length > 4
    ? [...filteredEvents, ...filteredEvents]
    : filteredEvents;

  useEffect(() => {
    if (!viewRef.current || filteredEvents.length === 0) return;

    const tick = () => {
      if (!pausedRef.current && viewRef.current) {
        exactScroll.current += SCROLL_SPEED;
        if (exactScroll.current >= 1) {
          const inc = Math.floor(exactScroll.current);
          viewRef.current.scrollTop += inc;
          exactScroll.current -= inc;
        }
        const halfH = viewRef.current.scrollHeight / 2;
        if (viewRef.current.scrollTop >= halfH && doubled.length > filteredEvents.length) {
          viewRef.current.scrollTop = 0;
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [filteredEvents, doubled.length]);

  return (
    <div className="gh-root">

      {/* Header */}
      <div className="gh-header">
        <div className="gh-header-left">
          <span className="gh-live-pip" />
          <span className="gh-title">Activity Stream</span>
          <span className="gh-user">@{GITHUB_USERNAME}</span>
        </div>
        <div className="gh-header-right">
          {lastSync && (
            <span className="gh-sync">
              synced {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <div className="gh-signal"><span /><span /><span /></div>
        </div>
      </div>

      {/* Filters */}
      <div className="gh-filters">
        {Object.entries(EVENT_CONFIG).map(([type, cfg]) => {
          const col    = TYPE_COLORS[cfg.cls];
          const active = activeFilters.length === 0 || activeFilters.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`gh-filter-btn${active ? "" : " inactive"}`}
              style={{
                color:       col.text,
                borderColor: col.border,
                background:  active ? col.bg : "transparent",
              }}
            >
              <i className={`ti ${cfg.icon}`} />
              {cfg.label}
            </button>
          );
        })}
        {activeFilters.length > 0 && (
          <button className="gh-clear-btn" onClick={() => setActiveFilters([])}>
            <i className="ti ti-x" />
            Clear
          </button>
        )}
      </div>

      {/* Viewport */}
      <div
        ref={viewRef}
        className="gh-viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="gh-fade-top" />

        {loading && [...Array(6)].map((_, i) => <SkeletonRow key={i} />)}

        {error && (
          <div className="gh-error">
            <i className="ti ti-alert-triangle" />
            {error}
          </div>
        )}

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="gh-empty">
            <i className="ti ti-inbox" />
            No events match the current filter
          </div>
        )}

        {!loading && !error && filteredEvents.length > 0 && (
          <div className="gh-track">
            {doubled.map((ev, i) => <EventRow key={`${ev.id}-${i}`} event={ev} />)}
          </div>
        )}

        {paused && (
          <div className="gh-paused">
            <i className="ti ti-player-pause" />
            Paused — scroll freely
          </div>
        )}

        <div className="gh-fade-bottom" />
      </div>

      {/* Footer */}
      <div className="gh-footer">
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank" rel="noreferrer"
          className="gh-footer-link"
        >
          <i className="ti ti-brand-github" />
          github.com/{GITHUB_USERNAME}
          <i className="ti ti-arrow-up-right" />
        </a>
        <div className="gh-footer-hint">
          <span className="gh-kbd">hover</span>
          to pause
          <span className="gh-kbd">scroll</span>
          to browse
        </div>
      </div>

    </div>
  );
}