import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.jsx";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      {/* Brand mark */}
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:28 }}>
        <div className="nav-logo-mark" style={{ width:36, height:36, fontSize:16, borderRadius:11 }}>P</div>
        <span style={{ fontSize:15, fontWeight:700, letterSpacing:"-.02em" }}>Pollr</span>
      </div>

      <h2>Welcome back</h2>
      <p className="subtitle">Sign in to manage your polls</p>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn btn-primary btn-full" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" style={{ width:16,height:16,borderWidth:2 }} />
              Signing in…
            </>
          ) : "Sign In"}
        </button>
      </form>

      <div className="form-footer">
        Don't have an account?{" "}
        <Link to="/signup">Create one free</Link>
      </div>
    </div>
  );
}
