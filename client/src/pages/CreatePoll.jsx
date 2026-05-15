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

const POLL_TEMPLATES = [
  {
    id: "blank",
    label: "Blank",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    ),
    question: "",
    options: ["", ""],
    blank: true,
  },
  {
    id: "yes-no",
    label: "Yes / No",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    question: "Do you agree with this?",
    options: ["Yes", "No"],
  },
  {
    id: "this-or-that",
    label: "This or That",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    question: "Which do you prefer?",
    options: ["Option A", "Option B"],
  },
  {
    id: "rating",
    label: "Rating Poll",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    question: "How would you rate your overall experience?",
    options: ["⭐ Poor", "⭐⭐ Fair", "⭐⭐⭐ Good", "⭐⭐⭐⭐ Great", "⭐⭐⭐⭐⭐ Excellent"],
  },
  {
    id: "quiz",
    label: "Quiz Poll",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    question: "Which of the following is correct?",
    options: ["Option A", "Option B", "Option C", "Option D"],
  },
  {
    id: "opinion",
    label: "Opinion Poll",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    question: "What is your opinion on this topic?",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
  },
  {
    id: "feedback",
    label: "Anonymous Feedback",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    question: "How satisfied are you with our service?",
    options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"],
  },
  {
    id: "multiple-choice",
    label: "Multiple Choice",
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    question: "Which of these best applies to you?",
    options: ["Choice A", "Choice B", "Choice C", "Choice D"],
  },
];

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState(defaultExpiry());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [activeTemplate, setActiveTemplate] = useState(null);

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

  const applyTemplate = (template) => {
    if (template.blank) {
      setQuestion("");
      setOptions(["", ""]);
      setActiveTemplate(null);
      return;
    }
    setActiveTemplate(template.id);
    setQuestion(template.question);

    const tplOptions = template.options.slice(0, 6);
    setOptions(
      tplOptions.length >= 2
        ? tplOptions
        : [...tplOptions, ...Array(2 - tplOptions.length).fill("")]
    );
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

        /* ════════════════════════════════════════════════════════
           ── Poll Templates Section ──
           ════════════════════════════════════════════════════════ */
        .cp-templates-section {
          padding: 24px 36px 24px;
          border-bottom: 1px solid var(--border, rgba(0,0,0,0.08));
          background: color-mix(in srgb, var(--accent, #6366f1) 2.5%, transparent);
        }
        .cp-templates-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .cp-templates-title {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .cp-templates-title-icon {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: color-mix(in srgb, var(--accent, #6366f1) 14%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cp-templates-title-icon svg { color: var(--accent, #6366f1); }
        .cp-templates-title span {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .cp-templates-hint {
          font-size: 11.5px;
          color: var(--text-dim);
        }

        /* ── Scrollable row of cards ── */
        .cp-templates-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .cp-templates-scroll::-webkit-scrollbar { display: none; }

        /* ── Individual template card ── */
        .cp-tpl-card {
          flex: 0 0 148px;
          min-width: 148px;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 13px 13px 11px;
          border-radius: 14px;
          border: 1.5px solid var(--border, rgba(0,0,0,0.10));
          background: var(--card-bg, var(--surface, #fff));
          cursor: pointer;
          transition: border-color 0.17s, box-shadow 0.17s, transform 0.13s, background 0.17s;
          text-align: left;
          font-family: inherit;
          user-select: none;
          position: relative;
          overflow: hidden;
        }
        .cp-tpl-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          background: color-mix(in srgb, var(--accent, #6366f1) 6%, transparent);
          transition: opacity 0.17s;
          pointer-events: none;
        }
        .cp-tpl-card:hover {
          border-color: var(--accent, #6366f1);
          transform: translateY(-2px);
          box-shadow:
            0 4px 14px color-mix(in srgb, var(--accent, #6366f1) 16%, transparent),
            0 1px 3px rgba(0,0,0,0.06);
        }
        .cp-tpl-card:hover::before { opacity: 1; }
        .cp-tpl-card:active { transform: translateY(0); }
        .cp-tpl-card:focus-visible {
          outline: none;
          border-color: var(--accent, #6366f1);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 22%, transparent);
        }
        /* Selected state */
        .cp-tpl-card.tpl-active {
          border-color: var(--accent, #6366f1);
          background: color-mix(in srgb, var(--accent, #6366f1) 7%, var(--surface, #fff));
          box-shadow:
            0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 18%, transparent),
            0 4px 16px color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
          transform: translateY(-1px);
        }
        .cp-tpl-card.tpl-active::before { opacity: 0; }

        /* Blank card */
        .cp-tpl-card.tpl-blank {
          border-style: dashed;
          background: transparent;
        }
        .cp-tpl-card.tpl-blank:hover {
          border-color: var(--text-muted, #888);
          background: color-mix(in srgb, var(--text-dim, #aaa) 5%, transparent);
          box-shadow: none;
          transform: translateY(-1px);
        }
        .cp-tpl-card.tpl-blank::before { display: none; }

        /* Card top row: icon + selected badge */
        .cp-tpl-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .cp-tpl-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent, #6366f1) 18%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent, #6366f1);
          flex-shrink: 0;
          transition: background 0.17s, border-color 0.17s;
          font-size: 15px;
          line-height: 1;
        }
        .cp-tpl-card.tpl-blank .cp-tpl-icon-wrap {
          background: color-mix(in srgb, var(--text-dim, #aaa) 10%, transparent);
          border-color: color-mix(in srgb, var(--text-dim, #aaa) 20%, transparent);
          color: var(--text-dim);
        }
        .cp-tpl-card.tpl-active .cp-tpl-icon-wrap {
          background: color-mix(in srgb, var(--accent, #6366f1) 18%, transparent);
        }
        /* Selected check badge */
        .cp-tpl-check {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.17s, transform 0.17s;
        }
        .cp-tpl-card.tpl-active .cp-tpl-check {
          opacity: 1;
          transform: scale(1);
        }
        .cp-tpl-check svg { color: #fff; }

        /* Card title */
        .cp-tpl-title {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text, inherit);
          margin: 0 0 3px;
          line-height: 1.2;
          letter-spacing: -0.1px;
        }
        .cp-tpl-card.tpl-blank .cp-tpl-title { color: var(--text-muted); }

        /* Card description */
        .cp-tpl-desc {
          font-size: 11px;
          color: var(--text-dim);
          margin: 0 0 9px;
          line-height: 1.35;
        }

        /* Mini option previews */
        .cp-tpl-preview {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: auto;
        }
        .cp-tpl-preview-pill {
          height: 18px;
          border-radius: 5px;
          background: color-mix(in srgb, var(--border, rgba(0,0,0,0.1)) 100%, transparent);
          border: 1px solid color-mix(in srgb, var(--border, rgba(0,0,0,0.08)) 100%, transparent);
          display: flex;
          align-items: center;
          padding: 0 6px;
          gap: 4px;
          overflow: hidden;
        }
        .cp-tpl-preview-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--accent, #6366f1) 40%, transparent);
          flex-shrink: 0;
        }
        .cp-tpl-card.tpl-active .cp-tpl-preview-dot {
          background: color-mix(in srgb, var(--accent, #6366f1) 65%, transparent);
        }
        .cp-tpl-preview-text {
          font-size: 9.5px;
          font-weight: 500;
          color: var(--text-dim);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1;
        }
        .cp-tpl-preview-more {
          font-size: 9px;
          color: var(--text-dim);
          padding-left: 2px;
          opacity: 0.7;
        }
        /* ═══════════════════════════════════════════════════════ */

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
          /* Templates responsive */
          .cp-templates-section { padding: 20px 20px 18px; }
          .cp-templates-header { flex-direction: column; align-items: flex-start; gap: 4px; }
          .cp-templates-hint { display: none; }
          .cp-tpl-card { flex: 0 0 132px; min-width: 132px; padding: 11px 11px 10px; }
          .cp-tpl-title { font-size: 12px; }
          .cp-tpl-desc { font-size: 10.5px; margin-bottom: 7px; }
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
            <div className="cp-templates-section">
              <div className="cp-templates-header">
                <div className="cp-templates-title">
                  <div className="cp-templates-title-icon">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <span>Templates</span>
                </div>
                <span className="cp-templates-hint">
                  Pick a starting point — everything stays editable
                </span>
              </div>
              <div className="cp-templates-scroll">
                {/* Blank / reset card */}
                <button
                  type="button"
                  className="cp-tpl-card tpl-blank"
                  onClick={() => applyTemplate(POLL_TEMPLATES[0])}
                  title="Start from scratch"
                >
                  <div className="cp-tpl-card-top">
                    <div className="cp-tpl-icon-wrap">{POLL_TEMPLATES[0].icon}</div>
                  </div>
                  <div className="cp-tpl-title">Blank Poll</div>
                  <div className="cp-tpl-desc">Start fresh with an empty form</div>
                  <div className="cp-tpl-preview">
                    <div className="cp-tpl-preview-pill">
                      <div className="cp-tpl-preview-dot" />
                      <span className="cp-tpl-preview-text">Your option…</span>
                    </div>
                    <div className="cp-tpl-preview-pill">
                      <div className="cp-tpl-preview-dot" />
                      <span className="cp-tpl-preview-text">Your option…</span>
                    </div>
                  </div>
                </button>

                {/* Rich template cards */}
                {POLL_TEMPLATES.slice(1).map((tpl) => {
                  const isActive = activeTemplate === tpl.id;
                  const previewOpts = tpl.options.slice(0, 2);
                  const extra = tpl.options.length - 2;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`cp-tpl-card${isActive ? " tpl-active" : ""}`}
                      onClick={() => applyTemplate(tpl)}
                      title={`Use ${tpl.label} template`}
                    >
                      <div className="cp-tpl-card-top">
                        <div className="cp-tpl-icon-wrap">{tpl.icon}</div>
                        <div className="cp-tpl-check">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>
                      <div className="cp-tpl-title">{tpl.label}</div>
                      <div className="cp-tpl-desc">
                        {tpl.id === "yes-no" && "Simple agreement check"}
                        {tpl.id === "this-or-that" && "Pick one of two options"}
                        {tpl.id === "rating" && "Collect star ratings"}
                        {tpl.id === "quiz" && "Test knowledge with choices"}
                        {tpl.id === "opinion" && "Gauge audience sentiment"}
                        {tpl.id === "feedback" && "Confidential satisfaction check"}
                        {tpl.id === "multiple-choice" && "Let people pick from a list"}
                      </div>
                      <div className="cp-tpl-preview">
                        {previewOpts.map((opt, i) => (
                          <div className="cp-tpl-preview-pill" key={i}>
                            <div className="cp-tpl-preview-dot" />
                            <span className="cp-tpl-preview-text">{opt}</span>
                          </div>
                        ))}
                        {extra > 0 && (
                          <span className="cp-tpl-preview-more">+{extra} more</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

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