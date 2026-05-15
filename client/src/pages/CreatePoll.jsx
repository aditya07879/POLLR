import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";

const defaultExpiry = () => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return d.toISOString().slice(0, 16);
};

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState(defaultExpiry());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateOption = (i, val) => {
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };
  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };
  const removeOption = (i) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) return setError("Question is required");
    if (trimmed.length < 2) return setError("At least 2 non-empty options required");
    if (new Date(expiresAt) <= new Date()) return setError("Expiry must be in the future");
    setLoading(true);
    try {
      const res = await api.post("/polls", {
        question: question.trim(),
        options: trimmed,
        expiresAt,
      });
      navigate(`/poll/${res.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const filledCount = options.filter((o) => o.trim()).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>New Poll</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 3 }}>
            Ask a question, collect real-time votes
          </p>
        </div>
      </div>

      <div className="create-card">
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Question */}
          <div className="form-group">
            <label>Your Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              required
              autoFocus
              style={{ fontSize: 15, padding: "12px 16px" }}
            />
          </div>

          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <label style={{ marginBottom: 0 }}>Answer Options</label>
              <span
                style={{
                  fontSize: 12,
                  color: filledCount >= 2 ? "var(--green)" : "var(--text-dim)",
                  fontWeight: 600,
                }}
              >
                {filledCount}/6 filled
              </span>
            </div>
            <div className="options-list">
              {options.map((opt, i) => (
                <div className="option-row" key={i}>
                  <div
                    style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-dim)",
                        fontFamily: "var(--mono)",
                        pointerEvents: "none",
                        userSelect: "none",
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      style={{ paddingLeft: 28 }}
                    />
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="option-remove"
                      onClick={() => removeOption(i)}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-option-btn"
              onClick={addOption}
              disabled={options.length >= 6}
            >
              + Add another option
            </button>
          </div>

          {/* Expiry */}
          <div className="form-group">
            <label>Poll Expires At</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>
              Voting will close automatically at this time
            </div>
          </div>

          <hr className="divider" />

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Creating…
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Create Poll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
