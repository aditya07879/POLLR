import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.jsx";

const toLocalDT = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
};

const defaultExpiry = () => {
  const d = new Date();
  d.setHours(d.getHours() + 24);
  return toLocalDT(d);
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

  const PRESETS = [
    { label: "10 min", minutes: 10 },
    { label: "30 min", minutes: 30 },
    { label: "1 hr", minutes: 60 },
    { label: "6 hrs", minutes: 360 },
    { label: "12 hrs", minutes: 720 },
    { label: "1 day", minutes: 1440 },
    { label: "3 days", minutes: 4320 },
    { label: "7 days", minutes: 10080 },
  ];

  const [activePreset, setActivePreset] = useState(5);

  const applyPreset = (idx) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + PRESETS[idx].minutes);
    setExpiresAt(toLocalDT(d));
    setActivePreset(idx);
  };

  const handleExpiryChange = (e) => {
    setExpiresAt(e.target.value);
    setActivePreset(null);
  };

  return (
    <>
      <style>{`
        .cp-wrapper {
          min-height: 100%;
          padding: 40px 16px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* ── Page header ── */
        .cp-header {
          width: 100%;
          max-width: 720px;
          margin-bottom: 28px;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .cp-header-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--accent, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--accent, #6366f1) 35%, transparent);
        }
        .cp-header-icon svg { color: #fff; }
        .cp-header-text h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 3px;
          color: var(--text, inherit);
          letter-spacing: -0.3px;
        }
        .cp-header-text p {
          font-size: 13.5px;
          color: var(--text-muted);
          margin: 0;
        }

        /* ── Card ── */
        .cp-card {
          width: 100%;
          max-width: 720px;
          background: var(--card-bg, var(--surface, #fff));
          border: 1px solid var(--border, rgba(0,0,0,0.09));
          border-radius: 20px;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.07),
            0 24px 56px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        /* ── Section blocks inside card ── */
        .cp-section {
          padding: 32px 36px;
        }
        .cp-section + .cp-section {
          border-top: 1px solid var(--border, rgba(0,0,0,0.08));
        }
        .cp-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .cp-section-label-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent, #6366f1);
          flex-shrink: 0;
        }
        .cp-section-label span {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Error banner ── */
        .cp-error {
          margin: 0 36px;
          margin-top: 24px;
          padding: 12px 16px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--red, #ef4444) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--red, #ef4444) 30%, transparent);
          color: var(--red, #ef4444);
          font-size: 13.5px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Question input ── */
        .cp-question-input {
          width: 100%;
          font-size: 16px;
          font-weight: 500;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid var(--border, rgba(0,0,0,0.12));
          background: var(--input-bg, var(--bg, #fafafa));
          color: var(--text, inherit);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
          line-height: 1.4;
        }
        .cp-question-input::placeholder { color: var(--text-dim); }
        .cp-question-input:focus {
          border-color: var(--accent, #6366f1);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 15%, transparent);
        }
        .cp-question-hint {
          font-size: 12px;
          color: var(--text-dim);
          margin-top: 8px;
        }

        /* ── Options header row ── */
        .cp-options-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .cp-options-counter {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-dim);
        }
        .cp-options-counter.ready { color: var(--green, #22c55e); }
        .cp-options-counter-bar {
          display: flex;
          gap: 3px;
        }
        .cp-options-counter-pip {
          width: 16px;
          height: 4px;
          border-radius: 2px;
          background: var(--border, rgba(0,0,0,0.1));
          transition: background 0.2s;
        }
        .cp-options-counter-pip.filled {
          background: var(--green, #22c55e);
        }

        /* ── Option rows ── */
        .cp-options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cp-option-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cp-option-badge {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--badge-bg, color-mix(in srgb, var(--accent, #6366f1) 10%, transparent));
          border: 1px solid color-mix(in srgb, var(--accent, #6366f1) 20%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: var(--accent, #6366f1);
          font-family: var(--mono, monospace);
          flex-shrink: 0;
          letter-spacing: 0;
        }
        .cp-option-input-wrap {
          flex: 1;
          position: relative;
        }
        .cp-option-input {
          width: 100%;
          font-size: 14px;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border, rgba(0,0,0,0.11));
          background: var(--input-bg, var(--bg, #fafafa));
          color: var(--text, inherit);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
        }
        .cp-option-input::placeholder { color: var(--text-dim); }
        .cp-option-input:focus {
          border-color: var(--accent, #6366f1);
          background: var(--surface, #fff);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
        }
        .cp-option-remove {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dim);
          font-size: 18px;
          line-height: 1;
          transition: background 0.15s, color 0.15s;
          padding: 0;
        }
        .cp-option-remove:hover {
          background: color-mix(in srgb, var(--red, #ef4444) 12%, transparent);
          color: var(--red, #ef4444);
        }

        /* ── Add option button ── */
        .cp-add-option-btn {
          margin-top: 12px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1.5px dashed var(--border, rgba(0,0,0,0.14));
          background: transparent;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.18s, color 0.18s, background 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .cp-add-option-btn:hover:not(:disabled) {
          border-color: var(--accent, #6366f1);
          color: var(--accent, #6366f1);
          background: color-mix(in srgb, var(--accent, #6366f1) 5%, transparent);
        }
        .cp-add-option-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ── Expiry section ── */
        .cp-expiry-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: start;
        }
        .cp-datetime-input {
          width: 100%;
          font-size: 14px;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border, rgba(0,0,0,0.11));
          background: var(--input-bg, var(--bg, #fafafa));
          color: var(--text, inherit);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .cp-datetime-input:focus {
          border-color: var(--accent, #6366f1);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
        }
        .cp-expiry-info {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 11px 14px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--text-dim, #aaa) 8%, transparent);
          white-space: nowrap;
        }
        .cp-expiry-info svg { flex-shrink: 0; color: var(--text-dim); }
        .cp-expiry-info span { font-size: 12px; color: var(--text-dim); font-weight: 500; }
        .cp-expiry-hint {
          font-size: 12px;
          color: var(--text-dim);
          margin-top: 8px;
        }

        /* ── Quick expiry presets ── */
        .cp-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 16px;
        }
        .cp-preset-chip {
          padding: 6px 13px;
          border-radius: 20px;
          border: 1.5px solid var(--border, rgba(0,0,0,0.12));
          background: transparent;
          color: var(--text-muted);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          line-height: 1;
          font-family: inherit;
        }
        .cp-preset-chip:hover {
          border-color: var(--accent, #6366f1);
          color: var(--accent, #6366f1);
          background: color-mix(in srgb, var(--accent, #6366f1) 7%, transparent);
        }
        .cp-preset-chip.active {
          border-color: var(--accent, #6366f1);
          background: var(--accent, #6366f1);
          color: #fff;
          box-shadow: 0 2px 8px color-mix(in srgb, var(--accent, #6366f1) 35%, transparent);
        }
        .cp-preset-divider {
          width: 1px;
          height: 22px;
          background: var(--border, rgba(0,0,0,0.1));
          align-self: center;
          flex-shrink: 0;
          margin: 0 2px;
        }
        .cp-expiry-manual-label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .cp-expiry-manual-label::before {
          content: '';
          display: inline-block;
          width: 14px;
          height: 1px;
          background: var(--border, rgba(0,0,0,0.15));
        }

        /* ── Actions bar ── */
        .cp-actions {
          padding: 24px 36px;
          border-top: 1px solid var(--border, rgba(0,0,0,0.08));
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          background: color-mix(in srgb, var(--bg, #f5f5f5) 60%, transparent);
        }
        .cp-actions-left {
          font-size: 12.5px;
          color: var(--text-dim);
        }
        .cp-actions-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Buttons reuse existing .btn .btn-ghost .btn-primary classes */
        .btn { display: inline-flex; align-items: center; gap: 7px; }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .cp-section { padding: 24px 20px; }
          .cp-error { margin: 0 20px; margin-top: 20px; }
          .cp-actions { padding: 20px; flex-direction: column-reverse; align-items: stretch; }
          .cp-actions-right { flex-direction: column-reverse; }
          .cp-actions-right .btn { width: 100%; justify-content: center; }
          .cp-expiry-row { grid-template-columns: 1fr; }
          .cp-expiry-info { display: none; }
          .cp-header { margin-bottom: 20px; }
          .cp-wrapper { padding: 20px 12px 48px; }
        }
        @media (max-width: 400px) {
          .cp-header-icon { display: none; }
        }
      `}</style>

      <div className="cp-wrapper">
        {/* ── Page header ── */}
        <div className="cp-header">
          <div className="cp-header-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div className="cp-header-text">
            <h1>New Poll</h1>
            <p>Ask a question, collect real-time votes</p>
          </div>
        </div>

        <div className="cp-card">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="cp-error">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="cp-section">
              <div className="cp-section-label">
                <div className="cp-section-label-dot" />
                <span>Your Question</span>
              </div>
              <input
                className="cp-question-input"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to ask?"
                required
                autoFocus
              />
              <div className="cp-question-hint">
                Be clear and concise — a great question gets more responses.
              </div>
            </div>

            <div className="cp-section">
              <div className="cp-section-label">
                <div className="cp-section-label-dot" />
                <span>Answer Options</span>
              </div>

              <div className="cp-options-header">
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Add up to 6 choices</div>
                <div className={`cp-options-counter ${filledCount >= 2 ? "ready" : ""}`}>
                  <div className="cp-options-counter-bar">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`cp-options-counter-pip ${i < filledCount ? "filled" : ""}`}
                      />
                    ))}
                  </div>
                  <span>{filledCount}/6</span>
                </div>
              </div>

              <div className="cp-options-list">
                {options.map((opt, i) => (
                  <div className="cp-option-row" key={i}>
                    <div className="cp-option-badge">{String.fromCharCode(65 + i)}</div>
                    <div className="cp-option-input-wrap">
                      <input
                        className="cp-option-input"
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="cp-option-remove"
                        onClick={() => removeOption(i)}
                        title="Remove option"
                        aria-label="Remove option"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cp-add-option-btn"
                onClick={addOption}
                disabled={options.length >= 6}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add another option
              </button>
            </div>

            <div className="cp-section">
              <div className="cp-section-label">
                <div className="cp-section-label-dot" />
                <span>Poll Expiry</span>
              </div>

              <div className="cp-presets">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`cp-preset-chip${activePreset === i ? " active" : ""}`}
                    onClick={() => applyPreset(i)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="cp-expiry-manual-label">or pick a custom time</div>
              <div className="cp-expiry-row">
                <div>
                  <input
                    className="cp-datetime-input"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={handleExpiryChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                  <div className="cp-expiry-hint">Voting closes automatically at this time.</div>
                </div>
                <div className="cp-expiry-info">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{activePreset !== null ? PRESETS[activePreset].label : "Custom"}</span>
                </div>
              </div>
            </div>

            <div className="cp-actions">
              <div className="cp-actions-left">
                {filledCount >= 2
                  ? `${filledCount} option${filledCount > 1 ? "s" : ""} ready`
                  : "Fill in at least 2 options"}
              </div>
              <div className="cp-actions-right">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => navigate("/dashboard")}
                >
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
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
