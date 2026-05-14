import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav>
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-logo">
          <span className="nav-logo-mark">P</span>
          Pollr
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="nav-link"
                style={isActive("/dashboard") ? { color: "var(--text)", background: "var(--bg2)" } : {}}
              >
                Dashboard
              </Link>
              <Link
                to="/create"
                className="btn btn-primary"
                style={{ fontSize: 13, padding: "6px 14px" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Poll
              </Link>
              <span className="nav-email">{user.email}</span>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 13, padding: "6px 14px" }}
                onClick={handleLogout}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="nav-link"
                style={isActive("/dashboard") ? { color: "var(--text)", background: "var(--bg2)" } : {}}
              >
                Dashboard
              </Link>
              <Link to="/create" className="btn btn-primary" style={{ fontSize: 13, padding: "6px 16px" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}