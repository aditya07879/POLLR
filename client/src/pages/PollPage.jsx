import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api.jsx";
import useCountdown from "../utils/useCountdown.jsx";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function PollPage() {
  const { slug } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);
  const { timeLeft, urgent } = useCountdown(poll?.expiresAt);

  useEffect(() => {
    fetchPoll();
  }, [slug]);

  useEffect(() => {
    if (!poll) return;
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current.emit("joinPoll", poll.slug);
    socketRef.current.on("voteUpdate", (updatedPoll) => setPoll(updatedPoll));
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leavePoll", poll.slug);
        socketRef.current.disconnect();
      }
    };
  }, [poll?.slug]);

  const fetchPoll = async () => {
    try {
      const res = await api.get(`/polls/${slug}`);
      setPoll(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Poll not found");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selected === null || voted || poll?.isExpired) return;
    setVoting(true);
    setVoteError("");
    try {
      const res = await api.post(`/polls/${slug}/vote`, { optionIndex: selected });
      setPoll(res.data);
      setVoted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Vote failed";
      setVoteError(msg);
      if (msg.includes("already voted")) setVoted(true);
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = poll?.options.reduce((s, o) => s + o.votes, 0) || 0;
  const getPct = (votes) => (totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100));
  const shareUrl = `${window.location.origin}/poll/${poll?.slug}`;
  const maxVotes = poll ? Math.max(...poll.options.map((o) => o.votes)) : 0;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading poll…
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading" style={{ flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>Poll not found</div>
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{error}</div>
        <Link to="/dashboard" className="btn btn-ghost" style={{ marginTop: 8 }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!poll) return null;

  const isExpired = poll.isExpired || timeLeft === "Expired";
  const showResults = voted || isExpired;
  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="poll-page">
      {/* Header card */}
      <div className="poll-header">
        <div className="poll-question">{poll.question}</div>
        <div className="poll-meta">
          {isExpired ? (
            <span className="badge badge-expired">Closed</span>
          ) : (
            <>
              <span className="badge badge-active">Live</span>
              <span className={`countdown${urgent ? " urgent" : ""}`}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {timeLeft}
              </span>
            </>
          )}
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Status messages */}
      {isExpired && (
        <div className="expired-banner">🔒 This poll has closed — results are final</div>
      )}
      {voted && !isExpired && (
        <div className="voted-msg">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Your vote has been recorded
        </div>
      )}
      {voteError && <div className="error-msg">{voteError}</div>}

      {/* Voting UI */}
      {!showResults && (
        <>
          <div className="options-vote">
            {poll.options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn${selected === i ? " selected" : ""}`}
                onClick={() => setSelected(i)}
                disabled={isExpired}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    marginRight: 12,
                    flexShrink: 0,
                    background: selected === i ? "var(--accent)" : "var(--bg2)",
                    color: selected === i ? "#fff" : "var(--text-dim)",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--mono)",
                    transition: "all .18s",
                  }}
                >
                  {LETTERS[i]}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleVote}
            disabled={selected === null || voting || isExpired}
            style={{ alignSelf: "flex-start", padding: "11px 24px" }}
          >
            {voting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Submitting…
              </>
            ) : (
              "Submit Vote"
            )}
          </button>
        </>
      )}

      {/* Results UI */}
      {showResults && (
        <div className="results-section">
          <div className="results-header">
            <span className="results-title">
              {!isExpired && <span className="live-dot" />}
              {isExpired ? "Final Results" : "Live Results"}
            </span>
            <span className="total-votes">{totalVotes} total votes</span>
          </div>

          {poll.options.map((opt, i) => {
            const pct = getPct(opt.votes);
            const isLeading = opt.votes === maxVotes && maxVotes > 0;
            return (
              <div className="result-bar-row" key={i}>
                <div className="result-bar-label">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        borderRadius: 5,
                        flexShrink: 0,
                        background: isLeading ? "var(--accent-dim)" : "var(--bg2)",
                        color: isLeading ? "var(--accent)" : "var(--text-dim)",
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: "var(--mono)",
                      }}
                    >
                      {LETTERS[i]}
                    </span>
                    {opt.text}
                    {isLeading && totalVotes > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--accent)",
                          fontWeight: 600,
                          background: "var(--accent-dim)",
                          padding: "1px 7px",
                          borderRadius: 99,
                        }}
                      >
                        Leading
                      </span>
                    )}
                  </span>
                  <span>
                    {pct}% · {opt.votes}
                  </span>
                </div>
                <div className="result-bar-track">
                  <div
                    className="result-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: isLeading
                        ? "linear-gradient(90deg,var(--accent),var(--accent2))"
                        : "linear-gradient(90deg,var(--border2),var(--border2))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share box */}
      <div className="share-box">
        <span className="share-label">Share</span>
        <input className="share-url" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
        <button className={`copy-btn${copied ? " copied" : ""}`} onClick={copyLink}>
          {copied ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ display: "inline", marginRight: 4 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            "Copy link"
          )}
        </button>
      </div>

      {/* Back link */}
      <Link
        to="/dashboard"
        style={{
          fontSize: 13.5,
          color: "var(--text-muted)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </Link>
    </div>
  );
}
