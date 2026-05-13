import { useMemo } from "react";
import { Link } from "react-router-dom";

function Skeleton({ h = 20, r = 10 }) {
  return <div style={{ width: "100%", height: h, borderRadius: r, background: "rgba(255,255,255,.06)", animation: "shimmer 1.6s linear infinite", backgroundImage: "linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 75%)", backgroundSize: "200% 100%" }} />;
}

function InsightCard({ icon, color, title, value, sub, badge }) {
  return (
    <div className="ins-card" style={{ borderColor: `${color}30`, background: `${color}0a` }}>
      <div className="ins-card-ico" style={{ background: `${color}1a`, color }}>{icon}</div>
      <div className="ins-card-title" style={{ color: `${color}cc` }}>{title}</div>
      <div className="ins-card-val">{value}</div>
      {sub && <div className="ins-card-sub">{sub}</div>}
      {badge && <div className="ins-card-badge" style={{ background: `${color}18`, color }}>{badge}</div>}
    </div>
  );
}

export default function Insights({ polls, loading }) {
  const totalVotes = (poll) => poll.options.reduce((s, o) => s + o.votes, 0);

  const insights = useMemo(() => {
    if (polls.length === 0) return null;

    const allVotes = polls.reduce((s, p) => s + totalVotes(p), 0);
    const avgVotesPerPoll = polls.length > 0 ? (allVotes / polls.length).toFixed(1) : 0;

    // Most popular poll
    const mostPopular = polls.reduce((best, p) => totalVotes(p) > totalVotes(best) ? p : best, polls[0]);

    // Poll with highest engagement variance (winner is far ahead)
    const mostDecisive = polls
      .filter(p => totalVotes(p) > 0)
      .map(p => {
        const votes = totalVotes(p);
        const sorted = [...p.options].sort((a, b) => b.votes - a.votes);
        const margin = sorted.length > 1 ? Math.round(((sorted[0].votes - sorted[1].votes) / votes) * 100) : 100;
        return { poll: p, margin };
      })
      .sort((a, b) => b.margin - a.margin)[0];

    // Closest race (smallest margin)
    const closestRace = polls
      .filter(p => totalVotes(p) > 1 && p.options.length >= 2)
      .map(p => {
        const votes = totalVotes(p);
        const sorted = [...p.options].sort((a, b) => b.votes - a.votes);
        const margin = sorted.length > 1 ? Math.abs(sorted[0].votes - sorted[1].votes) : Infinity;
        return { poll: p, margin, topTwo: sorted.slice(0, 2) };
      })
      .sort((a, b) => a.margin - b.margin)[0];

    // Most active (most votes)
    const mostActive = [...polls].sort((a, b) => totalVotes(b) - totalVotes(a))[0];

    // Health score
    const pollsWithVotes = polls.filter(p => totalVotes(p) > 0).length;
    const activePolls = polls.filter(p => !p.isExpired).length;
    const healthScore = polls.length > 0
      ? Math.round(((pollsWithVotes / polls.length) * 0.5 + (activePolls / polls.length) * 0.3 + Math.min(allVotes / (polls.length * 10), 1) * 0.2) * 100)
      : 0;

    return {
      mostPopular,
      mostDecisive,
      closestRace,
      mostActive,
      allVotes,
      avgVotesPerPoll,
      pollsWithVotes,
      activePolls,
      healthScore,
    };
  }, [polls]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} h={140} r={18} />)}
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="ins-empty-wrap">
        <div className="ins-empty-ico">🔮</div>
        <div className="ins-empty-h">Insights appear as you grow</div>
        <div className="ins-empty-p">Once you create polls and collect votes, you'll see winner predictions, poll health scores, engagement trends, and smart summaries here.</div>
        <Link to="/create" className="ins-cta-btn">Start Creating Polls</Link>
      </div>
    );
  }

  const allVotes = polls.reduce((s, p) => s + totalVotes(p), 0);

  return (
    <div className="ins-root">
      {/* Health Score Banner */}
      <div className="ins-health-banner">
        <div className="ins-health-left">
          <div className="ins-health-label">📊 Dashboard Health Score</div>
          <div className="ins-health-val">{insights?.healthScore ?? 0}<span>/100</span></div>
          <div className="ins-health-desc">
            {insights?.healthScore >= 80 ? "🟢 Excellent engagement — your polls are thriving!" :
             insights?.healthScore >= 50 ? "🟡 Good activity — keep sharing your polls for more data" :
             "🔴 Low engagement — try sharing your polls on social media"}
          </div>
        </div>
        <div className="ins-health-bars">
          {[
            { label: "Vote Coverage", val: insights ? Math.round((insights.pollsWithVotes / polls.length) * 100) : 0, color: "#6366f1" },
            { label: "Active Ratio", val: insights ? Math.round((insights.activePolls / polls.length) * 100) : 0, color: "#10b981" },
            { label: "Vote Density", val: insights ? Math.min(100, Math.round((allVotes / (polls.length * 10)) * 100)) : 0, color: "#ec4899" },
          ].map(item => (
            <div key={item.label} className="ins-health-bar-row">
              <div className="ins-health-bar-label">{item.label}</div>
              <div className="ins-health-bar-track">
                <div className="ins-health-bar-fill" style={{ width: item.val + "%", background: item.color }} />
              </div>
              <div className="ins-health-bar-val" style={{ color: item.color }}>{item.val}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="ins-grid">
        <InsightCard
          icon="🏆"
          color="#f59e0b"
          title="Most Popular Poll"
          value={insights?.mostActive ? insights.mostActive.question.slice(0, 40) + (insights.mostActive.question.length > 40 ? "…" : "") : "No data"}
          sub={insights?.mostActive ? `${totalVotes(insights.mostActive)} total votes` : ""}
          badge="Highest engagement"
        />
        <InsightCard
          icon="⚡"
          color="#6366f1"
          title="Most Decisive Winner"
          value={insights?.mostDecisive ? `${insights.mostDecisive.margin}% lead` : "Not enough data"}
          sub={insights?.mostDecisive ? insights.mostDecisive.poll.question.slice(0, 36) + "…" : "Need 2+ options with votes"}
          badge="Clear winner"
        />
        <InsightCard
          icon="🔥"
          color="#ec4899"
          title="Closest Race"
          value={insights?.closestRace
            ? `${insights.closestRace.topTwo[0].text.slice(0, 12)} vs ${insights.closestRace.topTwo[1].text.slice(0, 12)}`
            : "No close races yet"}
          sub={insights?.closestRace ? `Only ${insights.closestRace.margin} vote${insights.closestRace.margin !== 1 ? "s" : ""} apart` : "Need more votes"}
          badge="Neck and neck"
        />
        <InsightCard
          icon="📈"
          color="#06b6d4"
          title="Total Votes Collected"
          value={allVotes.toLocaleString()}
          sub={`${polls.length} polls · ${insights?.avgVotesPerPoll} avg per poll`}
          badge="All time"
        />
        <InsightCard
          icon="🎯"
          color="#10b981"
          title="Polls With Votes"
          value={`${insights?.pollsWithVotes ?? 0} / ${polls.length}`}
          sub={polls.length > 0 ? `${Math.round(((insights?.pollsWithVotes ?? 0) / polls.length) * 100)}% fill rate` : ""}
          badge="Coverage"
        />
        <InsightCard
          icon="⏳"
          color="#8b5cf6"
          title="Active Polls"
          value={`${insights?.activePolls ?? 0} running`}
          sub={`${polls.filter(p => p.isExpired).length} closed · ${insights?.activePolls ?? 0} collecting votes`}
          badge="Live now"
        />
      </div>

      {/* Recommendations */}
      <div className="ins-recs-card">
        <div className="ins-recs-title">💡 Smart Recommendations</div>
        <div className="ins-recs-sub">Based on your current poll data</div>
        <div className="ins-recs-list">
          {allVotes === 0 && (
            <div className="ins-rec-item">
              <div className="ins-rec-dot" style={{ background: "#f59e0b" }} />
              <div>
                <div className="ins-rec-h">Share your polls to collect first votes</div>
                <div className="ins-rec-p">Your polls exist but have no votes yet. Copy the poll link and share it on social media or with your community.</div>
              </div>
            </div>
          )}
          {polls.filter(p => !p.isExpired).length === 0 && (
            <div className="ins-rec-item">
              <div className="ins-rec-dot" style={{ background: "#f87171" }} />
              <div>
                <div className="ins-rec-h">All polls are closed — create a new one</div>
                <div className="ins-rec-p">You have no active polls. Create a new poll to start collecting fresh data.</div>
              </div>
            </div>
          )}
          {polls.filter(p => !p.isExpired).length > 0 && allVotes > 0 && (
            <div className="ins-rec-item">
              <div className="ins-rec-dot" style={{ background: "#10b981" }} />
              <div>
                <div className="ins-rec-h">Great work! Your polls are collecting votes</div>
                <div className="ins-rec-p">Keep momentum going — consider creating follow-up polls or sharing existing ones for more participation.</div>
              </div>
            </div>
          )}
          {polls.length < 3 && (
            <div className="ins-rec-item">
              <div className="ins-rec-dot" style={{ background: "#6366f1" }} />
              <div>
                <div className="ins-rec-h">Create more polls to unlock deeper insights</div>
                <div className="ins-rec-p">With 5+ polls, you'll see trend analysis, engagement patterns, and audience preference maps.</div>
              </div>
            </div>
          )}
          {insights?.closestRace && (
            <div className="ins-rec-item">
              <div className="ins-rec-dot" style={{ background: "#ec4899" }} />
              <div>
                <div className="ins-rec-h">"{insights.closestRace.poll.question.slice(0, 40)}…" is a very close race</div>
                <div className="ins-rec-p">Top options are only {insights.closestRace.margin} vote(s) apart. Share this poll to break the tie!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
