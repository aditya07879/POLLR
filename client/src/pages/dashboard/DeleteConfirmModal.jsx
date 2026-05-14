import { useEffect, useRef } from "react";

/**
 * DeleteConfirmModal
 *
 * Drop-in replacement for the browser's native confirm() dialog.
 *
 * Props:
 *   isOpen   – boolean: controls visibility
 *   onCancel – () => void: called when user cancels
 *   onConfirm– () => void: called when user confirms deletion
 *   pollName – string (optional): poll question shown in the modal body
 */
export default function DeleteConfirmModal({ isOpen, onCancel, onConfirm, pollName }) {
  const confirmBtnRef = useRef(null);

  /* Trap focus + ESC key */
  useEffect(() => {
    if (!isOpen) return;
    confirmBtnRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Styles (scoped via class prefix dcm-) ── */}
      <style>{`
        /* ── Overlay ───────────────────────────────── */
        .dcm-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, .55);
          backdrop-filter: blur(6px) saturate(140%);
          -webkit-backdrop-filter: blur(6px) saturate(140%);
          animation: dcm-fade-in .18s ease both;
        }

        /* ── Card ──────────────────────────────────── */
        .dcm-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: var(--surface, #1e1e2e);
          border: 1px solid var(--border, rgba(255,255,255,.1));
          border-radius: 20px;
          padding: 32px 28px 28px;
          box-shadow:
            0 24px 80px rgba(0,0,0,.45),
            0 8px 24px rgba(0,0,0,.25),
            0 0 0 1px rgba(255,255,255,.04) inset;
          animation: dcm-scale-in .22s cubic-bezier(.34,1.46,.64,1) both;
          overflow: hidden;
        }

        /* subtle top accent line */
        .dcm-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #ef4444, #f97316 50%, #ef4444);
          border-radius: 20px 20px 0 0;
        }

        /* ── Icon ──────────────────────────────────── */
        .dcm-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .dcm-icon-wrap svg {
          width: 24px;
          height: 24px;
          stroke: #ef4444;
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        /* ── Title ─────────────────────────────────── */
        .dcm-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -.025em;
          color: var(--text, #f1f5f9);
          margin-bottom: 10px;
          font-family: var(--font, 'Sora', system-ui, sans-serif);
        }

        /* ── Body ──────────────────────────────────── */
        .dcm-body {
          font-size: 14px;
          color: var(--text-muted, rgba(255,255,255,.5));
          line-height: 1.65;
          margin-bottom: 8px;
          font-family: var(--font, 'Sora', system-ui, sans-serif);
        }
        .dcm-poll-name {
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: bottom;
          color: var(--text, #f1f5f9);
          font-weight: 600;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.08);
          padding: 1px 8px;
          border-radius: 6px;
          font-size: 13.5px;
        }
        .dcm-warning {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          color: #f97316;
          background: rgba(249,115,22,.08);
          border: 1px solid rgba(249,115,22,.18);
          border-radius: 8px;
          padding: 8px 12px;
          margin-top: 14px;
          font-family: var(--font, 'Sora', system-ui, sans-serif);
        }
        .dcm-warning svg {
          width: 14px;
          height: 14px;
          stroke: #f97316;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        /* ── Divider ───────────────────────────────── */
        .dcm-divider {
          height: 1px;
          background: var(--border, rgba(255,255,255,.08));
          margin: 24px 0 20px;
        }

        /* ── Actions ───────────────────────────────── */
        .dcm-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        /* Cancel button */
        .dcm-btn-cancel {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 20px;
          border-radius: 10px;
          font-family: var(--font, 'Sora', system-ui, sans-serif);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: var(--text-muted, rgba(255,255,255,.55));
          border: 1px solid var(--border, rgba(255,255,255,.1));
          transition: background .15s, color .15s, border-color .15s, transform .15s;
          white-space: nowrap;
        }
        .dcm-btn-cancel:hover {
          background: var(--bg2, rgba(255,255,255,.05));
          color: var(--text, #f1f5f9);
          border-color: var(--border2, rgba(255,255,255,.18));
          transform: translateY(-1px);
        }
        .dcm-btn-cancel:active { transform: translateY(0); }

        /* Delete button */
        .dcm-btn-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px 22px;
          border-radius: 10px;
          font-family: var(--font, 'Sora', system-ui, sans-serif);
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
          border: 1px solid rgba(239,68,68,.3);
          box-shadow: 0 2px 10px rgba(239,68,68,.3), inset 0 1px 0 rgba(255,255,255,.12);
          transition: all .18s cubic-bezier(.25,.46,.45,.94);
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        .dcm-btn-delete::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent);
          transition: left .4s ease;
        }
        .dcm-btn-delete:hover::before { left: 100%; }
        .dcm-btn-delete:hover {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          box-shadow: 0 6px 20px rgba(239,68,68,.45);
          transform: translateY(-1px);
        }
        .dcm-btn-delete:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(239,68,68,.3); }
        .dcm-btn-delete svg {
          width: 14px;
          height: 14px;
          stroke: #fff;
          fill: none;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
        }

        /* ── Animations ────────────────────────────── */
        @keyframes dcm-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dcm-scale-in {
          from { opacity: 0; transform: scale(.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Responsive ────────────────────────────── */
        @media (max-width: 480px) {
          .dcm-card { padding: 24px 20px 20px; border-radius: 16px; }
          .dcm-actions { flex-direction: column-reverse; }
          .dcm-btn-cancel,
          .dcm-btn-delete { width: 100%; justify-content: center; }
        }

        /* ── Light theme overrides ──────────────────── */
        [data-theme="light"] .dcm-card {
          background: #ffffff;
          border-color: rgba(0,0,0,.08);
          box-shadow: 0 24px 80px rgba(0,0,0,.18), 0 8px 24px rgba(0,0,0,.1);
        }
        [data-theme="light"] .dcm-card::before {
          background: linear-gradient(90deg, #ef4444, #f97316 50%, #ef4444);
        }
        [data-theme="light"] .dcm-title   { color: #0f172a; }
        [data-theme="light"] .dcm-body    { color: #64748b; }
        [data-theme="light"] .dcm-poll-name {
          color: #1e293b;
          background: rgba(0,0,0,.04);
          border-color: rgba(0,0,0,.08);
        }
        [data-theme="light"] .dcm-btn-cancel {
          color: #64748b;
          border-color: #e2e8f0;
        }
        [data-theme="light"] .dcm-btn-cancel:hover {
          background: #f8fafc;
          color: #1e293b;
          border-color: #cbd5e1;
        }
        [data-theme="light"] .dcm-overlay {
          background: rgba(15,23,42,.45);
        }
      `}</style>

      {/* ── Overlay (click outside = cancel) ── */}
      <div
        className="dcm-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dcm-title"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <div className="dcm-card">

          {/* Icon */}
          <div className="dcm-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </div>

          {/* Title */}
          <div className="dcm-title" id="dcm-title">Delete this poll?</div>

          {/* Body */}
          <div className="dcm-body">
            {pollName ? (
              <>
                You're about to permanently delete{" "}
                <span className="dcm-poll-name" title={pollName}>{pollName}</span>
                {" "}and all its votes.
              </>
            ) : (
              "This poll and all its votes will be permanently removed."
            )}
          </div>

          {/* Warning chip */}
          <div className="dcm-warning" aria-live="polite">
            <svg viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            This action cannot be undone.
          </div>

          <div className="dcm-divider" />

          {/* Actions */}
          <div className="dcm-actions">
            <button className="dcm-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              ref={confirmBtnRef}
              className="dcm-btn-delete"
              onClick={onConfirm}
            >
              <svg viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
              Delete Poll
            </button>
          </div>

        </div>
      </div>
    </>
  );
}