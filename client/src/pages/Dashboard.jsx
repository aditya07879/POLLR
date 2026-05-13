import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../utils/api.jsx";
import Overview from "./dashboard/Overview.jsx";
import MyPolls from "./dashboard/MyPolls.jsx";
import Analytics from "./dashboard/Analytics.jsx";
import Insights from "./dashboard/Insights.jsx";

/* ── Sidebar shared component ──────────────────────────── */
function SidebarContent({ sidebarOpen, activeNav, setActiveNav, user, logout, navigate, polls, navItems }) {
  return (
    <div className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
      <div className="sb-logo">
        <div className="sb-mark">P</div>
        {sidebarOpen && (
          <div>
            <div className="sb-title">Pollr</div>
            <div className="sb-sub">ANALYTICS PRO</div>
          </div>
        )}
      </div>

      <div className="sb-nav">
        {sidebarOpen && <div className="sb-section-lbl">Workspace</div>}
        {navItems.map(n => (
          <div key={n.id} className={`sb-item ${activeNav === n.id ? "active" : ""}`} onClick={() => setActiveNav(n.id)}>
            <span className="sb-icon">{n.icon}</span>
            {sidebarOpen && <span className="sb-lbl">{n.label}</span>}
            {sidebarOpen && n.badge !== null && <span className="sb-badge">{n.badge}</span>}
          </div>
        ))}

        {sidebarOpen && <div className="sb-section-lbl" style={{ marginTop: 18 }}>Actions</div>}
        <Link to="/create" className="sb-item" style={{ textDecoration: "none" }}>
          <span className="sb-icon">✦</span>
          {sidebarOpen && <span className="sb-lbl">New Poll</span>}
        </Link>
        <div className="sb-item" onClick={() => navigate("/")}>
          <span className="sb-icon">⌂</span>
          {sidebarOpen && <span className="sb-lbl">Home</span>}
        </div>
      </div>

      <div className="sb-footer">
        <div className="user-row">
          <div className="u-avatar">{user?.email?.[0]?.toUpperCase() || "U"}</div>
          {sidebarOpen && (
            <div style={{ minWidth: 0 }}>
              <div className="u-name">{user?.email?.split("@")[0] || "User"}</div>
              <div className="u-out" onClick={logout}>Sign out →</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────── */
export default function Dashboard() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const [filter, setFilter] = useState("weekly");
  const [animStarted, setAnimStarted] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => { fetchPolls(); }, []);
  useEffect(() => { if (!loading) setTimeout(() => setAnimStarted(true), 200); }, [loading]);
  useEffect(() => { setSidebarMobile(false); }, [activeNav]);

  const fetchPolls = async () => {
    try {
      const res = await api.get("/polls/user");
      setPolls(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this poll? This cannot be undone.")) return;
    try {
      await api.delete(`/polls/${id}`);
      setPolls(p => p.filter(x => x._id !== id));
    } catch (err) { alert(err.response?.data?.message || "Failed to delete poll"); }
  };

  const navItems = [
    { id: "overview", icon: "⬡", label: "Overview", badge: null },
    { id: "polls", icon: "◈", label: "My Polls", badge: polls.length > 0 ? polls.length : null },
    { id: "analytics", icon: "◉", label: "Analytics", badge: null },
    { id: "insights", icon: "◆", label: "Insights", badge: null },
  ];

  const pageLabels = { overview: "Overview", polls: "My Polls", analytics: "Analytics", insights: "Insights" };
  const pageDescriptions = {
    overview: polls.filter(p => !p.isExpired).length > 0
      ? `${polls.filter(p => !p.isExpired).length} active poll${polls.filter(p => !p.isExpired).length > 1 ? "s" : ""} collecting votes. Analytics are live.`
      : "Create your first poll and watch your analytics come alive.",
    polls: "Manage all your polls — view results, share links, or delete old ones.",
    analytics: "Deep dive into participation rates, vote distribution, and poll performance.",
    insights: "Smart predictions and data-driven recommendations based on your polls.",
  };

  const sharedProps = { polls, loading, filter, animStarted };

  const renderPage = () => {
    switch (activeNav) {
      case "overview":  return <Overview {...sharedProps} />;
      case "polls":     return <MyPolls {...sharedProps} onDelete={handleDelete} />;
      case "analytics": return <Analytics {...sharedProps} />;
      case "insights":  return <Insights {...sharedProps} />;
      default:          return <Overview {...sharedProps} />;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes blobFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(28px,-18px) scale(1.04)}66%{transform:translate(-18px,14px) scale(.97)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes pageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        .dash-shell{display:flex;min-height:100vh;font-family:'Sora',sans-serif;background:var(--ds-bg,#070714);color:var(--ds-text,#f1f5f9);position:relative;overflow:hidden}
        [data-theme="light"] .dash-shell{--ds-bg:#f0f2ff;--ds-text:#1e1b4b}

        .dash-blob{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;animation:blobFloat ease-in-out infinite}
        .db1{width:480px;height:480px;background:radial-gradient(circle,rgba(99,102,241,.3),transparent 70%);top:-130px;right:-90px;animation-duration:14s}
        .db2{width:350px;height:350px;background:radial-gradient(circle,rgba(6,182,212,.2),transparent 70%);bottom:40px;left:-70px;animation-duration:10s;animation-delay:-4s}
        .db3{width:260px;height:260px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 70%);top:42%;left:36%;animation-duration:16s;animation-delay:-8s}
        [data-theme="light"] .db1{background:radial-gradient(circle,rgba(99,102,241,.1),transparent 70%)}
        [data-theme="light"] .db2{background:radial-gradient(circle,rgba(6,182,212,.06),transparent 70%)}
        [data-theme="light"] .db3{background:radial-gradient(circle,rgba(236,72,153,.05),transparent 70%)}

        /* Sidebar */
        .sidebar{width:256px;min-height:100vh;flex-shrink:0;background:rgba(10,10,22,.9);backdrop-filter:blur(32px) saturate(160%);border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;transition:width .3s cubic-bezier(.25,.46,.45,.94);position:relative;z-index:60}
        [data-theme="light"] .sidebar{background:rgba(240,242,255,.94);border-right-color:rgba(99,102,241,.14)}
        .sidebar.collapsed{width:68px}
        .sb-logo{padding:22px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.06);min-height:72px}
        [data-theme="light"] .sb-logo{border-bottom-color:rgba(99,102,241,.1)}
        .sb-mark{width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 0 20px rgba(99,102,241,.4)}
        .sb-title{font-size:17px;font-weight:800;color:#fff;letter-spacing:-.03em;white-space:nowrap}
        [data-theme="light"] .sb-title{color:#1e1b4b}
        .sb-sub{font-size:10px;color:rgba(255,255,255,.25);font-weight:600;white-space:nowrap;letter-spacing:.12em;text-transform:uppercase}
        [data-theme="light"] .sb-sub{color:rgba(99,102,241,.4)}
        .sb-nav{padding:14px 10px;flex:1;overflow-y:auto}
        .sb-section-lbl{font-size:9.5px;color:rgba(255,255,255,.24);font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:0 10px;margin:8px 0 6px;white-space:nowrap}
        [data-theme="light"] .sb-section-lbl{color:rgba(99,102,241,.38)}
        .sb-item{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:11px;cursor:pointer;transition:all .18s;margin-bottom:2px;color:rgba(255,255,255,.4);font-size:13px;font-weight:600;position:relative;overflow:hidden;border:1px solid transparent;text-decoration:none}
        [data-theme="light"] .sb-item{color:rgba(30,27,75,.42)}
        .sb-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.85)}
        [data-theme="light"] .sb-item:hover{background:rgba(99,102,241,.07);color:#1e1b4b}
        .sb-item.active{background:linear-gradient(135deg,rgba(99,102,241,.22),rgba(139,92,246,.14));color:#fff;border-color:rgba(99,102,241,.3)}
        [data-theme="light"] .sb-item.active{background:rgba(99,102,241,.12);color:#1e1b4b;border-color:rgba(99,102,241,.25)}
        .sb-item.active::before{content:'';position:absolute;left:0;top:22%;height:56%;width:2.5px;background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:0 3px 3px 0}
        .sb-icon{font-size:16px;flex-shrink:0;width:22px;text-align:center}
        .sb-lbl{white-space:nowrap;overflow:hidden;flex:1}
        .sb-badge{background:rgba(99,102,241,.25);color:#a5b4fc;font-size:10px;font-weight:800;padding:1px 6px;border-radius:20px;flex-shrink:0}
        [data-theme="light"] .sb-badge{background:rgba(99,102,241,.12);color:#6366f1}
        .sb-footer{padding:14px 10px;border-top:1px solid rgba(255,255,255,.06)}
        [data-theme="light"] .sb-footer{border-top-color:rgba(99,102,241,.1)}
        .user-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:11px;background:rgba(255,255,255,.04)}
        [data-theme="light"] .user-row{background:rgba(99,102,241,.06)}
        .u-avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#ec4899);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;flex-shrink:0}
        .u-name{font-size:12.5px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden}
        [data-theme="light"] .u-name{color:#1e1b4b}
        .u-out{font-size:11px;color:rgba(255,255,255,.28);cursor:pointer;transition:color .15s}
        [data-theme="light"] .u-out{color:rgba(99,102,241,.4)}
        .u-out:hover{color:rgba(255,255,255,.65)}
        [data-theme="light"] .u-out:hover{color:#6366f1}

        /* Main + topbar */
        .main{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-width:0}
        .topbar{height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 26px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(7,7,20,.8);backdrop-filter:blur(24px);position:sticky;top:0;z-index:50}
        [data-theme="light"] .topbar{background:rgba(240,242,255,.9);border-bottom-color:rgba(99,102,241,.12)}
        .tb-left{display:flex;align-items:center;gap:14px}
        .hamburger{width:36px;height:36px;border:none;background:rgba(255,255,255,.06);border-radius:10px;cursor:pointer;color:rgba(255,255,255,.5);font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .18s}
        [data-theme="light"] .hamburger{background:rgba(99,102,241,.08);color:rgba(99,102,241,.55)}
        .hamburger:hover{background:rgba(255,255,255,.1);color:#fff}
        [data-theme="light"] .hamburger:hover{background:rgba(99,102,241,.14);color:#4f46e5}
        .crumb{font-size:12.5px;color:rgba(255,255,255,.3);display:flex;align-items:center;gap:7px}
        [data-theme="light"] .crumb{color:rgba(99,102,241,.38)}
        .crumb-active{color:#fff;font-weight:700}
        [data-theme="light"] .crumb-active{color:#1e1b4b}
        .tb-right{display:flex;align-items:center;gap:9px}
        .filter-tabs{display:flex;gap:3px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:3px}
        [data-theme="light"] .filter-tabs{background:rgba(99,102,241,.05);border-color:rgba(99,102,241,.14)}
        .f-tab{padding:5px 13px;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,.36);font-size:12px;font-weight:600;cursor:pointer;transition:all .18s;font-family:'Sora',sans-serif}
        [data-theme="light"] .f-tab{color:rgba(99,102,241,.42)}
        .f-tab.on{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 2px 8px rgba(99,102,241,.4)}
        .db-new-btn{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;padding:8px 16px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s;box-shadow:0 4px 14px rgba(99,102,241,.3);font-family:'Sora',sans-serif}
        .db-new-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.45)}
        .theme-btn{width:36px;height:36px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);border-radius:10px;cursor:pointer;color:rgba(255,255,255,.6);font-size:15px;display:flex;align-items:center;justify-content:center;transition:all .18s}
        [data-theme="light"] .theme-btn{background:rgba(99,102,241,.07);border-color:rgba(99,102,241,.15);color:rgba(99,102,241,.6)}
        .theme-btn:hover{background:rgba(255,255,255,.1);color:#fff}

        /* Hero */
        .hero-band{background:linear-gradient(135deg,rgba(99,102,241,.13),rgba(139,92,246,.08),rgba(6,182,212,.05));border:1px solid rgba(99,102,241,.2);border-radius:20px;padding:28px 30px;margin-bottom:22px;position:relative;overflow:hidden;animation:fadeUp .5s ease both}
        [data-theme="light"] .hero-band{background:linear-gradient(135deg,rgba(99,102,241,.07),rgba(139,92,246,.04));border-color:rgba(99,102,241,.16)}
        .hero-band::after{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(circle,rgba(99,102,241,.18),transparent 70%);border-radius:50%}
        .live-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.11);border:1px solid rgba(16,185,129,.23);border-radius:20px;padding:4px 10px;font-size:10.5px;font-weight:700;color:#10b981;margin-bottom:9px}
        .live-dot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulseGlow 2s ease-in-out infinite}
        .hero-h{font-size:23px;font-weight:800;color:#fff;margin-bottom:4px;letter-spacing:-.025em}
        [data-theme="light"] .hero-h{color:#1e1b4b}
        .hero-p{font-size:13px;color:rgba(255,255,255,.38);max-width:480px;line-height:1.65}
        [data-theme="light"] .hero-p{color:rgba(30,27,75,.43)}

        /* Content */
        .content{padding:22px 24px 60px}
        .page-wrap{animation:pageIn .32s ease both}

        /* ─── Overview ─── */
        .ov-root{display:flex;flex-direction:column;gap:17px}
        .ov-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .ov-stat-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:19px;animation:fadeUp .55s ease both;transition:all .22s}
        [data-theme="light"] .ov-stat-card{background:#fff;border-color:rgba(99,102,241,.1);box-shadow:0 1px 8px rgba(99,102,241,.06)}
        .ov-stat-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.12)}
        [data-theme="light"] .ov-stat-card:hover{box-shadow:0 4px 16px rgba(99,102,241,.1)}
        .ov-stat-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;margin-bottom:12px}
        .ov-stat-num{font-family:'IBM Plex Mono',monospace;font-size:30px;font-weight:700;color:#fff;line-height:1;margin-bottom:4px}
        [data-theme="light"] .ov-stat-num{color:#1e1b4b}
        .ov-stat-lbl{font-size:12px;color:rgba(255,255,255,.37);font-weight:500}
        [data-theme="light"] .ov-stat-lbl{color:rgba(30,27,75,.45)}
        .ov-stat-badge{display:inline-flex;margin-top:9px;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:700}
        .ov-charts-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .ov-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px;animation:fadeUp .65s ease both}
        [data-theme="light"] .ov-card{background:#fff;border-color:rgba(99,102,241,.1);box-shadow:0 1px 8px rgba(99,102,241,.06)}
        .ov-c-title{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px}
        [data-theme="light"] .ov-c-title{color:#1e1b4b}
        .ov-c-sub{font-size:11.5px;color:rgba(255,255,255,.32);margin-bottom:16px}
        [data-theme="light"] .ov-c-sub{color:rgba(30,27,75,.38)}
        .ov-activity-row{display:grid;grid-template-columns:260px 1fr;gap:14px}
        .ov-act-item{display:flex;gap:11px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04)}
        .ov-act-dot{width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0}
        .ov-act-q{font-size:12px;color:rgba(255,255,255,.72);font-weight:600;margin-bottom:2px;line-height:1.4}
        [data-theme="light"] .ov-act-q{color:#1e1b4b}
        .ov-act-meta{font-size:10.5px;color:rgba(255,255,255,.27)}
        [data-theme="light"] .ov-act-meta{color:rgba(30,27,75,.38)}
        .ov-lb-row{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04)}
        .ov-lb-rank{width:22px;font-size:10.5px;font-weight:800;flex-shrink:0}
        .ov-lb-text{font-size:11.5px;color:rgba(255,255,255,.58);font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        [data-theme="light"] .ov-lb-text{color:rgba(30,27,75,.62)}
        .ov-lb-bar-bg{height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;width:52px;flex-shrink:0}
        .ov-lb-bar-fill{height:100%;border-radius:2px;transition:width 1.3s cubic-bezier(.25,.46,.45,.94)}
        .ov-lb-v{font-size:12px;font-weight:700;color:#fff;white-space:nowrap}
        [data-theme="light"] .ov-lb-v{color:#1e1b4b}
        .ov-empty-inline{font-size:12px;color:rgba(255,255,255,.22);padding:16px 0}
        .ov-empty-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 40px;text-align:center}
        .ov-empty-ico{width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.08));border:1px solid rgba(99,102,241,.2);display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:22px}
        .ov-empty-h{font-size:20px;font-weight:800;color:#fff;margin-bottom:10px}
        [data-theme="light"] .ov-empty-h{color:#1e1b4b}
        .ov-empty-p{font-size:13.5px;color:rgba(255,255,255,.37);max-width:360px;line-height:1.7;margin-bottom:24px}
        [data-theme="light"] .ov-empty-p{color:rgba(30,27,75,.43)}
        .ov-cta-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:12px;padding:11px 24px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;box-shadow:0 4px 16px rgba(99,102,241,.35)}

        /* ─── My Polls ─── */
        .mp-root{display:flex;flex-direction:column;gap:17px}
        .mp-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px}
        .mp-title{font-size:22px;font-weight:800;color:#fff;letter-spacing:-.025em}
        [data-theme="light"] .mp-title{color:#1e1b4b}
        .mp-subtitle{font-size:13px;color:rgba(255,255,255,.33);margin-top:3px}
        [data-theme="light"] .mp-subtitle{color:rgba(30,27,75,.4)}
        .mp-new-btn{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;padding:9px 18px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s;box-shadow:0 4px 14px rgba(99,102,241,.3);font-family:'Sora',sans-serif}
        .mp-new-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.45)}
        .mp-controls{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .mp-search-wrap{flex:1;min-width:200px;position:relative}
        .mp-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;opacity:.38}
        .mp-search{width:100%;padding:9px 12px 9px 34px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;font-family:'Sora',sans-serif;outline:none;transition:all .2s;box-sizing:border-box}
        [data-theme="light"] .mp-search{background:#fff;border-color:rgba(99,102,241,.18);color:#1e1b4b}
        .mp-search:focus{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.05)}
        .mp-search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.35);font-size:12px;cursor:pointer}
        .mp-filters{display:flex;gap:3px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:3px}
        [data-theme="light"] .mp-filters{background:rgba(99,102,241,.04);border-color:rgba(99,102,241,.12)}
        .mp-filter-btn{padding:6px 13px;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,.34);font-size:12px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s}
        [data-theme="light"] .mp-filter-btn{color:rgba(99,102,241,.38)}
        .mp-filter-btn.active{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
        .mp-sort{padding:9px 12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:rgba(255,255,255,.65);font-size:12px;font-family:'Sora',sans-serif;outline:none;cursor:pointer}
        [data-theme="light"] .mp-sort{background:#fff;border-color:rgba(99,102,241,.18);color:#1e1b4b}
        .mp-list{display:flex;flex-direction:column;gap:10px}
        .mp-poll-card{display:flex;align-items:flex-start;gap:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:15px;padding:18px;transition:all .2s;animation:fadeUp .5s ease both}
        [data-theme="light"] .mp-poll-card{background:#fff;border-color:rgba(99,102,241,.1);box-shadow:0 1px 6px rgba(99,102,241,.06)}
        .mp-poll-card:hover{border-color:rgba(255,255,255,.12);transform:translateX(3px)}
        [data-theme="light"] .mp-poll-card:hover{box-shadow:0 4px 16px rgba(99,102,241,.1)}
        .mp-poll-left{flex:1;min-width:0}
        .mp-poll-q{font-size:14.5px;font-weight:700;color:#fff;margin-bottom:8px;line-height:1.4}
        [data-theme="light"] .mp-poll-q{color:#1e1b4b}
        .mp-poll-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:9px;align-items:center}
        .mp-status-pill{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700}
        .mp-status-pill.active{background:rgba(16,185,129,.13);color:#10b981;border:1px solid rgba(16,185,129,.24)}
        .mp-status-pill.closed{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)}
        .mp-meta-item{font-size:11.5px;color:rgba(255,255,255,.3);font-weight:500}
        [data-theme="light"] .mp-meta-item{color:rgba(30,27,75,.38)}
        .mp-leading{font-size:11.5px;color:rgba(255,255,255,.43);margin-bottom:10px}
        [data-theme="light"] .mp-leading{color:rgba(30,27,75,.5)}
        .mp-options-preview{display:flex;flex-direction:column;gap:4px}
        .mp-opt-row{display:flex;align-items:center;gap:8px}
        .mp-opt-label{font-size:11px;color:rgba(255,255,255,.43);min-width:76px;flex-shrink:0}
        [data-theme="light"] .mp-opt-label{color:rgba(30,27,75,.48)}
        .mp-opt-bar-bg{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
        [data-theme="light"] .mp-opt-bar-bg{background:rgba(99,102,241,.08)}
        .mp-opt-bar-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:2px;transition:width .9s ease}
        .mp-opt-pct{font-size:10.5px;font-weight:700;color:rgba(255,255,255,.45);min-width:28px;text-align:right}
        [data-theme="light"] .mp-opt-pct{color:rgba(99,102,241,.55)}
        .mp-poll-actions{display:flex;flex-direction:column;gap:6px;flex-shrink:0}
        .mp-act-btn{padding:6px 14px;border-radius:9px;border:none;font-size:12px;font-weight:700;cursor:pointer;transition:all .18s;font-family:'Sora',sans-serif;white-space:nowrap}
        .mp-act-btn.view{background:rgba(99,102,241,.14);color:#a5b4fc;border:1px solid rgba(99,102,241,.24)}
        .mp-act-btn.view:hover{background:rgba(99,102,241,.24);color:#fff}
        .mp-act-btn.copy{background:rgba(6,182,212,.11);color:#67e8f9;border:1px solid rgba(6,182,212,.2)}
        .mp-act-btn.copy:hover{background:rgba(6,182,212,.2)}
        .mp-act-btn.delete{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.18)}
        .mp-act-btn.delete:hover{background:rgba(239,68,68,.17)}
        .mp-empty{display:flex;flex-direction:column;align-items:center;padding:70px 40px;text-align:center}
        .mp-empty-ico{font-size:44px;margin-bottom:18px;opacity:.42}
        .mp-empty-h{font-size:18px;font-weight:800;color:#fff;margin-bottom:8px}
        [data-theme="light"] .mp-empty-h{color:#1e1b4b}
        .mp-empty-p{font-size:13px;color:rgba(255,255,255,.33);max-width:300px;line-height:1.65}
        [data-theme="light"] .mp-empty-p{color:rgba(30,27,75,.4)}

        /* ─── Analytics ─── */
        .an-root{display:flex;flex-direction:column;gap:15px}
        .an-period-banner{display:flex;align-items:center;gap:10px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:12px;padding:11px 16px;font-size:13px;color:rgba(255,255,255,.62)}
        [data-theme="light"] .an-period-banner{background:rgba(99,102,241,.06);color:rgba(30,27,75,.58)}
        .an-period-banner strong{color:#fff}
        [data-theme="light"] .an-period-banner strong{color:#1e1b4b}
        .an-period-icon{font-size:15px}
        .an-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:21px;animation:fadeUp .55s ease both}
        [data-theme="light"] .an-card{background:#fff;border-color:rgba(99,102,241,.1);box-shadow:0 1px 8px rgba(99,102,241,.06)}
        .an-c-title{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px}
        [data-theme="light"] .an-c-title{color:#1e1b4b}
        .an-c-sub{font-size:11.5px;color:rgba(255,255,255,.32);margin-bottom:16px}
        [data-theme="light"] .an-c-sub{color:rgba(30,27,75,.38)}
        .an-rings-row{display:flex;gap:20px;justify-content:space-around;padding:12px 0;flex-wrap:wrap}
        .an-ring-item{display:flex;flex-direction:column;align-items:center}
        .an-ring-divider{width:1px;background:rgba(255,255,255,.07);align-self:stretch}
        .an-charts-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .an-pie-legend{display:flex;flex-direction:column;gap:5px;margin-top:10px}
        .an-pie-legend-item{display:flex;align-items:center;gap:7px}
        .an-pie-legend-label{font-size:11px;color:rgba(255,255,255,.48);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        [data-theme="light"] .an-pie-legend-label{color:rgba(30,27,75,.52)}
        .an-pie-legend-val{font-size:12px;font-weight:700;color:#fff}
        [data-theme="light"] .an-pie-legend-val{color:#1e1b4b}
        .an-poll-select{padding:5px 10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:rgba(255,255,255,.68);font-size:11.5px;font-family:'Sora',sans-serif;outline:none;max-width:160px;cursor:pointer}
        [data-theme="light"] .an-poll-select{background:#f8faff;border-color:rgba(99,102,241,.18);color:#1e1b4b}
        .an-empty-chart{display:flex;flex-direction:column;align-items:center;justify-content:center;height:180px;gap:10px}
        .an-table{margin-top:10px}
        .an-table-header{display:grid;grid-template-columns:1fr 90px 70px 70px 160px 90px;gap:8px;padding:8px 12px;background:rgba(255,255,255,.04);border-radius:10px;margin-bottom:4px}
        [data-theme="light"] .an-table-header{background:rgba(99,102,241,.05)}
        .an-th{font-size:10.5px;font-weight:700;color:rgba(255,255,255,.28);letter-spacing:.06em;text-transform:uppercase}
        [data-theme="light"] .an-th{color:rgba(99,102,241,.42)}
        .an-th.center{text-align:center}
        .an-table-row{display:grid;grid-template-columns:1fr 90px 70px 70px 160px 90px;gap:8px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s}
        .an-table-row:hover{background:rgba(255,255,255,.03)}
        [data-theme="light"] .an-table-row:hover{background:rgba(99,102,241,.03)}
        .an-td{font-size:12.5px;color:rgba(255,255,255,.63);display:flex;align-items:center}
        [data-theme="light"] .an-td{color:rgba(30,27,75,.63)}
        .an-td.center{justify-content:center}
        .an-td-q{color:#fff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        [data-theme="light"] .an-td-q{color:#1e1b4b}
        .an-td-bold{font-weight:700;color:#fff;font-family:'IBM Plex Mono',monospace}
        [data-theme="light"] .an-td-bold{color:#1e1b4b}
        .an-status-pill{display:inline-flex;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:700}
        .an-status-pill.active{background:rgba(16,185,129,.12);color:#10b981}
        .an-status-pill.closed{background:rgba(239,68,68,.1);color:#f87171}
        .an-empty-rings{font-size:12.5px;color:rgba(255,255,255,.24);text-align:center;padding:16px 0}
        .an-empty-wrap,.ins-empty-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 40px;text-align:center}
        .an-empty-ico,.ins-empty-ico{font-size:52px;margin-bottom:20px;opacity:.38}
        .an-empty-h,.ins-empty-h{font-size:19px;font-weight:800;color:#fff;margin-bottom:10px}
        [data-theme="light"] .an-empty-h,[data-theme="light"] .ins-empty-h{color:#1e1b4b}
        .an-empty-p,.ins-empty-p{font-size:13.5px;color:rgba(255,255,255,.36);max-width:380px;line-height:1.7;margin-bottom:22px}
        [data-theme="light"] .an-empty-p,[data-theme="light"] .ins-empty-p{color:rgba(30,27,75,.43)}
        .an-cta-btn,.ins-cta-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:12px;padding:11px 24px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;box-shadow:0 4px 16px rgba(99,102,241,.3)}

        /* ─── Insights ─── */
        .ins-root{display:flex;flex-direction:column;gap:15px}
        .ins-health-banner{display:flex;align-items:flex-start;gap:24px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:18px;padding:24px;animation:fadeUp .5s ease both}
        [data-theme="light"] .ins-health-banner{background:rgba(99,102,241,.06)}
        .ins-health-left{flex-shrink:0}
        .ins-health-label{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.32);margin-bottom:6px}
        [data-theme="light"] .ins-health-label{color:rgba(99,102,241,.45)}
        .ins-health-val{font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:700;color:#fff;line-height:1;margin-bottom:6px}
        [data-theme="light"] .ins-health-val{color:#1e1b4b}
        .ins-health-val span{font-size:18px;color:rgba(255,255,255,.28)}
        [data-theme="light"] .ins-health-val span{color:rgba(30,27,75,.28)}
        .ins-health-desc{font-size:12.5px;color:rgba(255,255,255,.42);max-width:220px;line-height:1.5}
        [data-theme="light"] .ins-health-desc{color:rgba(30,27,75,.48)}
        .ins-health-bars{flex:1;display:flex;flex-direction:column;gap:12px;justify-content:center}
        .ins-health-bar-row{display:flex;align-items:center;gap:10px}
        .ins-health-bar-label{font-size:12px;color:rgba(255,255,255,.42);min-width:100px}
        [data-theme="light"] .ins-health-bar-label{color:rgba(30,27,75,.48)}
        .ins-health-bar-track{flex:1;height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
        [data-theme="light"] .ins-health-bar-track{background:rgba(99,102,241,.08)}
        .ins-health-bar-fill{height:100%;border-radius:3px;transition:width 1.2s cubic-bezier(.25,.46,.45,.94)}
        .ins-health-bar-val{font-size:12px;font-weight:700;min-width:36px;text-align:right}
        .ins-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
        .ins-card{border-radius:16px;padding:19px;border:1px solid rgba(255,255,255,.07);transition:all .22s;animation:fadeUp .6s ease both}
        [data-theme="light"] .ins-card{box-shadow:0 1px 6px rgba(99,102,241,.06)}
        .ins-card:hover{transform:translateY(-2px)}
        .ins-card-ico{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:12px}
        .ins-card-title{font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px}
        .ins-card-val{font-size:15px;font-weight:700;color:#fff;margin-bottom:5px;line-height:1.3}
        [data-theme="light"] .ins-card-val{color:#1e1b4b}
        .ins-card-sub{font-size:11.5px;color:rgba(255,255,255,.33)}
        [data-theme="light"] .ins-card-sub{color:rgba(30,27,75,.38)}
        .ins-card-badge{display:inline-flex;margin-top:9px;padding:2px 8px;border-radius:20px;font-size:10.5px;font-weight:700}
        .ins-recs-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:21px;animation:fadeUp .7s ease both}
        [data-theme="light"] .ins-recs-card{background:#fff;border-color:rgba(99,102,241,.1)}
        .ins-recs-title{font-size:16px;font-weight:800;color:#fff;margin-bottom:4px}
        [data-theme="light"] .ins-recs-title{color:#1e1b4b}
        .ins-recs-sub{font-size:12px;color:rgba(255,255,255,.32);margin-bottom:18px}
        [data-theme="light"] .ins-recs-sub{color:rgba(30,27,75,.38)}
        .ins-recs-list{display:flex;flex-direction:column;gap:14px}
        .ins-rec-item{display:flex;gap:14px;align-items:flex-start}
        .ins-rec-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
        .ins-rec-h{font-size:13.5px;font-weight:700;color:#fff;margin-bottom:3px}
        [data-theme="light"] .ins-rec-h{color:#1e1b4b}
        .ins-rec-p{font-size:12px;color:rgba(255,255,255,.38);line-height:1.55}
        [data-theme="light"] .ins-rec-p{color:rgba(30,27,75,.43)}
        [data-theme="light"] .ov-act-item{border-bottom-color:rgba(99,102,241,.08)}
        [data-theme="light"] .ov-lb-bar-bg{background:rgba(99,102,241,.1)}
        [data-theme="light"] .ov-lb-row{border-bottom-color:rgba(99,102,241,.08)}
        [data-theme="light"] .ov-empty-inline{color:rgba(30,27,75,.35)}
        [data-theme="light"] .an-ring-divider{background:rgba(99,102,241,.12)}
        [data-theme="light"] .an-empty-rings{color:rgba(30,27,75,.38)}

        /* Overlay sidebar (mobile) */
        .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:55}
        .sidebar-mobile-wrap{position:fixed!important;left:0;top:0;height:100vh;z-index:60;transform:translateX(-100%);transition:transform .3s cubic-bezier(.25,.46,.45,.94)}
        .sidebar-mobile-wrap.open{transform:translateX(0)}

        /* Responsive */
        @media(max-width:1100px){.ov-stats-grid{grid-template-columns:repeat(2,1fr)}.ins-grid{grid-template-columns:repeat(2,1fr)}.an-table-header,.an-table-row{grid-template-columns:1fr 80px 60px 60px 120px 65px}}
        @media(max-width:900px){.ov-charts-2col,.an-charts-2col{grid-template-columns:1fr}.ov-activity-row{grid-template-columns:1fr}.ins-health-banner{flex-direction:column}.sidebar{display:none}.sidebar-overlay{display:block}.sidebar-mobile-wrap{display:block!important}.sidebar-mobile-wrap .sidebar{display:flex!important}}
        @media(max-width:640px){.ov-stats-grid{grid-template-columns:1fr 1fr}.ins-grid{grid-template-columns:1fr}.mp-controls{flex-direction:column;align-items:stretch}.an-table-header,.an-table-row{grid-template-columns:1fr 65px 55px}.an-th:nth-child(n+4),.an-td:nth-child(n+4){display:none}.content{padding:14px 12px 50px}.topbar{padding:0 12px}.filter-tabs{display:none}}
      `}</style>

      <div className="dash-shell">
        <div className="dash-blob db1" />
        <div className="dash-blob db2" />
        <div className="dash-blob db3" />

        {/* Mobile overlay */}
        {sidebarMobile && <div className="sidebar-overlay" onClick={() => setSidebarMobile(false)} />}

        {/* Desktop sidebar */}
        <SidebarContent
          sidebarOpen={sidebarOpen} activeNav={activeNav}
          setActiveNav={setActiveNav} user={user} logout={logout}
          navigate={navigate} polls={polls} navItems={navItems}
        />

        {/* Mobile sidebar - only rendered when open, prevents double sidebar on desktop */}
        {sidebarMobile && (
          <div className="sidebar-mobile-wrap open">
            <SidebarContent
              sidebarOpen={true} activeNav={activeNav}
              setActiveNav={setActiveNav} user={user} logout={logout}
              navigate={navigate} polls={polls} navItems={navItems}
            />
          </div>
        )}

        {/* Main area */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="tb-left">
              <button className="hamburger" onClick={() => {
                if (window.matchMedia('(max-width: 900px)').matches) {
                  setSidebarMobile(v => !v);
                } else {
                  setSidebarOpen(v => !v);
                }
              }}>☰</button>
              <div className="crumb">
                <span>Pollr</span>
                <span>›</span>
                <span className="crumb-active">{pageLabels[activeNav]}</span>
              </div>
            </div>
            <div className="tb-right">
              <div className="filter-tabs">
                {["daily", "weekly", "monthly"].map(f => (
                  <button key={f} className={`f-tab ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <Link to="/create" className="db-new-btn">
                <span>+</span> New Poll
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            <div className="hero-band">
              <div className="live-badge"><div className="live-dot" /> Live Dashboard</div>
              <div className="hero-h">
                {activeNav === "overview" && `Welcome back, ${user?.email?.split("@")[0] || "Creator"} 👋`}
                {activeNav === "polls" && "My Polls"}
                {activeNav === "analytics" && "Analytics Dashboard"}
                {activeNav === "insights" && "Smart Insights"}
              </div>
              <div className="hero-p">{pageDescriptions[activeNav]}</div>
            </div>

            <div className="page-wrap" key={`${activeNav}-${filter}`}>
              {renderPage()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}