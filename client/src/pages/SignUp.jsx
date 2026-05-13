import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.jsx";

export default function SignUp() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:28 }}>
        <div className="nav-logo-mark" style={{ width:36, height:36, fontSize:16, borderRadius:11 }}>P</div>
        <span style={{ fontSize:15, fontWeight:700, letterSpacing:"-.02em" }}>Pollr</span>
      </div>

      <h2>Create account</h2>
      <p className="subtitle">Start creating polls in seconds — it's free</p>

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
            placeholder="Min. 6 characters"
            required
          />
          <div style={{ fontSize:12, color:"var(--text-dim)", marginTop:6 }}>
            Must be at least 6 characters
          </div>
        </div>
        <button className="btn btn-primary btn-full" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" style={{ width:16, height:16, borderWidth:2 }} />
              Creating account…
            </>
          ) : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop:24, padding:"16px 0", borderTop:"1px solid var(--border)" }}>
        {["Real-time live results", "Shareable poll links", "Expiry countdown timer"].map((f) => (
          <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--text-muted)", marginBottom:7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {f}
          </div>
        ))}
      </div>

      <div className="form-footer">
        Already have an account?{" "}
        <Link to="/signin">Sign in</Link>
      </div>
    </div>
  );
}
