import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteConfirmModal from "./DeleteConfirmModal"; // ← new import

function Skeleton({ h = 20, r = 10 }) {
  return (
    <div
      style={{
        width: "100%",
        height: h,
        borderRadius: r,
        background: "rgba(255,255,255,.06)",
        animation: "shimmer 1.6s linear infinite",
        backgroundImage:
          "linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export default function MyPolls({ polls, loading, onDelete }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [deleteTarget, setDeleteTarget] = useState(null); // { id, question }

  const navigate = useNavigate();

  const totalVotes = (poll) => poll.options.reduce((s, o) => s + o.votes, 0);

  const filtered = polls
    .filter((p) => {
      const matchSearch = p.question.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : statusFilter === "active" ? !p.isExpired : p.isExpired;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "votes") return totalVotes(b) - totalVotes(a);
      if (sortBy === "options") return b.options.length - a.options.length;
      return 0;
    });

  const handleDeleteClick = (poll) => {
    // Show custom modal instead of window.confirm()
    setDeleteTarget({ id: poll._id, question: poll.question });
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Skeleton h={52} r={14} />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} h={90} r={14} />
        ))}
      </div>
    );
  }

  return (
    <div className="mp-root">
      {/* ── Custom delete confirmation modal ── */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        pollName={deleteTarget?.question}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Header */}
      <div className="mp-header">
        <div>
          <div className="mp-title">My Polls</div>
          <div className="mp-subtitle">
            {polls.length} poll{polls.length !== 1 ? "s" : ""} total ·{" "}
            {polls.filter((p) => !p.isExpired).length} active
          </div>
        </div>
        <Link to="/create" className="mp-new-btn">
          <span>+</span> Create Poll
        </Link>
      </div>

      {/* Controls */}
      <div className="mp-controls">
        <div className="mp-search-wrap">
          <span className="mp-search-icon">🔍</span>
          <input
            className="mp-search"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="mp-search-clear" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
        <div className="mp-filters">
          {["all", "active", "closed"].map((s) => (
            <button
              key={s}
              className={`mp-filter-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <select className="mp-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="votes">Most votes</option>
          <option value="options">Most options</option>
        </select>
      </div>

      {/* Poll List */}
      {filtered.length === 0 ? (
        <div className="mp-empty">
          <div className="mp-empty-ico">{search ? "🔍" : "📋"}</div>
          <div className="mp-empty-h">
            {search
              ? "No polls match your search"
              : polls.length === 0
                ? "No polls yet"
                : "No polls in this category"}
          </div>
          <div className="mp-empty-p">
            {search
              ? "Try a different search term"
              : polls.length === 0
                ? "Create your first poll to get started"
                : "Try a different filter"}
          </div>
          {polls.length === 0 && (
            <Link to="/create" className="mp-new-btn" style={{ marginTop: 18 }}>
              Create Poll
            </Link>
          )}
        </div>
      ) : (
        <div className="mp-list">
          {filtered.map((poll, i) => {
            const votes = totalVotes(poll);
            const topOption = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
            const expiresAt = new Date(poll.expiresAt);
            const createdAt = new Date(poll.createdAt);
            const daysLeft = Math.max(
              0,
              Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))
            );

            return (
              <div
                key={poll._id}
                className="mp-poll-card"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="mp-poll-left">
                  <div className="mp-poll-q">{poll.question}</div>
                  <div className="mp-poll-meta">
                    <span className={`mp-status-pill ${poll.isExpired ? "closed" : "active"}`}>
                      {poll.isExpired ? "Closed" : "Active"}
                    </span>
                    <span className="mp-meta-item">📊 {votes} votes</span>
                    <span className="mp-meta-item">⚙️ {poll.options.length} options</span>
                    <span className="mp-meta-item">
                      📅 Created{" "}
                      {createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {!poll.isExpired && (
                      <span
                        className="mp-meta-item"
                        style={{ color: daysLeft <= 1 ? "#f87171" : "rgba(255,255,255,.35)" }}
                      >
                        ⏰ {daysLeft === 0 ? "Expires today" : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>
                  {votes > 0 && topOption && (
                    <div className="mp-leading">
                      Leading:{" "}
                      <span style={{ color: "#818cf8", fontWeight: 700 }}>{topOption.text}</span>{" "}
                      with {topOption.votes} votes
                    </div>
                  )}

                  <div className="mp-options-preview">
                    {poll.options.slice(0, 3).map((opt, j) => {
                      const pct = votes > 0 ? Math.round((opt.votes / votes) * 100) : 0;
                      return (
                        <div key={j} className="mp-opt-row">
                          <div className="mp-opt-label">
                            {opt.text.slice(0, 24)}
                            {opt.text.length > 24 ? "…" : ""}
                          </div>
                          <div className="mp-opt-bar-bg">
                            <div className="mp-opt-bar-fill" style={{ width: pct + "%" }} />
                          </div>
                          <div className="mp-opt-pct">{pct}%</div>
                        </div>
                      );
                    })}
                    {poll.options.length > 3 && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.28)", marginTop: 3 }}>
                        +{poll.options.length - 3} more options
                      </div>
                    )}
                  </div>
                </div>
                <div className="mp-poll-actions">
                  <button
                    className="mp-act-btn view"
                    onClick={() => navigate(`/poll/${poll.slug}`)}
                  >
                    View Poll
                  </button>
                  <button
                    className="mp-act-btn copy"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.slug}`);
                    }}
                  >
                    Copy Link
                  </button>

                  <button
                    className="mp-act-btn delete"
                    onClick={() => onDelete(poll._id, poll.question)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
