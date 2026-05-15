import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#f87171"];

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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const tooltipBg = isDark ? "rgba(12,12,28,.98)" : "rgba(255,255,255,.98)";
  const tooltipLabelColor = isDark ? "rgba(255,255,255,.55)" : "rgba(30,27,75,.5)";
  return (
    <div
      style={{
        background: tooltipBg,
        border: "1px solid rgba(99,102,241,.3)",
        borderRadius: 12,
        padding: "10px 16px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(0,0,0,.15)",
      }}
    >
      <div style={{ fontSize: 11, color: tooltipLabelColor, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || "#6366f1" }}>
          {p.value} {p.name}
        </div>
      ))}
    </div>
  );
}

function ProgressRing({ pct = 0, size = 90, stroke = 8, color = "#6366f1", label, sublabel }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const trackColor = isDark ? "rgba(255,255,255,.07)" : "rgba(99,102,241,.10)";
  const pctColor = isDark ? "#fff" : "#1e1b4b";
  const labelColor = isDark ? "#e2e8f0" : "#1e1b4b";
  const sublabelColor = isDark ? "rgba(255,255,255,.35)" : "rgba(30,27,75,.45)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.25,.46,.45,.94)" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 800,
            color: pctColor,
          }}
        >
          {pct}%
        </div>
      </div>
      {label && (
        <div style={{ fontSize: 12, fontWeight: 700, color: labelColor, textAlign: "center" }}>
          {label}
        </div>
      )}
      {sublabel && (
        <div style={{ fontSize: 11, color: sublabelColor, textAlign: "center" }}>{sublabel}</div>
      )}
    </div>
  );
}

export default function Analytics({ polls, loading, filter }) {
  const [selectedPoll, setSelectedPoll] = useState(null);
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const chartTickColor = isLight ? "rgba(30,27,75,.5)" : "rgba(255,255,255,.4)";
  const chartTickColorStrong = isLight ? "rgba(30,27,75,.65)" : "rgba(255,255,255,.55)";
  const chartGridColor = isLight ? "rgba(99,102,241,.1)" : "rgba(255,255,255,.05)";
  const emptyTextColor = isLight ? "rgba(30,27,75,.4)" : "rgba(255,255,255,.35)";
  const emptySubColor = isLight ? "rgba(30,27,75,.28)" : "rgba(255,255,255,.2)";

  const totalVotes = (poll) => poll.options.reduce((s, o) => s + o.votes, 0);
  const activePolls = polls.filter((p) => !p.isExpired);
  const closedPolls = polls.filter((p) => p.isExpired);
  const allVotes = polls.reduce((s, p) => s + totalVotes(p), 0);

  const filteredPolls = useMemo(() => {
    const now = new Date();
    return polls.filter((p) => {
      const created = new Date(p.createdAt);
      if (filter === "daily") return now - created < 86400000;
      if (filter === "weekly") return now - created < 7 * 86400000;
      return now - created < 30 * 86400000;
    });
  }, [polls, filter]);

  const filteredVotes = filteredPolls.reduce((s, p) => s + totalVotes(p), 0);

  const activeRatio = polls.length > 0 ? Math.round((activePolls.length / polls.length) * 100) : 0;

  const pollsWithVotes = polls.filter((p) => totalVotes(p) > 0).length;
  const fillRate = polls.length > 0 ? Math.round((pollsWithVotes / polls.length) * 100) : 0;

  const completionRate =
    polls.length > 0 ? Math.round((closedPolls.length / polls.length) * 100) : 0;

  const pieData = polls
    .filter((p) => totalVotes(p) > 0)
    .sort((a, b) => totalVotes(b) - totalVotes(a))
    .slice(0, 6)
    .map((p, i) => ({
      name: p.question.length > 24 ? p.question.slice(0, 24) + "…" : p.question,
      value: totalVotes(p),
      color: COLORS[i % COLORS.length],
    }));

  const focusPoll = selectedPoll
    ? polls.find((p) => p._id === selectedPoll)
    : polls.length > 0
      ? polls.reduce((best, p) => (totalVotes(p) > totalVotes(best) ? p : best), polls[0])
      : null;
  const focusVotes = focusPoll ? totalVotes(focusPoll) : 0;
  const focusBarData = focusPoll
    ? focusPoll.options.map((o) => ({
        name: o.text.length > 16 ? o.text.slice(0, 16) + "…" : o.text,
        votes: o.votes,
        pct: focusVotes > 0 ? Math.round((o.votes / focusVotes) * 100) : 0,
      }))
    : [];

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} h={160} r={18} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Skeleton h={240} r={18} />
          <Skeleton h={240} r={18} />
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="an-empty-wrap">
        <div className="an-empty-ico">📉</div>
        <div className="an-empty-h">Analytics will appear once you have polls</div>
        <div className="an-empty-p">
          Create polls, share them, and collect votes. All your participation data will show up
          here.
        </div>
        <a href="/create" className="an-cta-btn">
          Create Your First Poll
        </a>
      </div>
    );
  }

  return (
    <div className="an-root">
      <div className="an-period-banner">
        <span className="an-period-icon">📅</span>
        Showing analytics for the{" "}
        <strong>
          {filter === "daily"
            ? "last 24 hours"
            : filter === "weekly"
              ? "last 7 days"
              : "last 30 days"}
        </strong>
        &nbsp;· {filteredPolls.length} poll{filteredPolls.length !== 1 ? "s" : ""} · {filteredVotes}{" "}
        votes
      </div>

      <div className="an-card" style={{ marginBottom: 16 }}>
        <div className="an-c-title">Participation Analytics</div>
        <div className="an-c-sub">Calculated from your actual poll data</div>
        <div className="an-rings-row">
          <div className="an-ring-item">
            <ProgressRing
              pct={activeRatio}
              color="#6366f1"
              label="Active Ratio"
              sublabel={`${activePolls.length} of ${polls.length} polls active`}
            />
          </div>
          <div className="an-ring-divider" />
          <div className="an-ring-item">
            <ProgressRing
              pct={fillRate}
              color="#06b6d4"
              label="Fill Rate"
              sublabel={`${pollsWithVotes} polls received votes`}
            />
          </div>
          <div className="an-ring-divider" />
          <div className="an-ring-item">
            <ProgressRing
              pct={completionRate}
              color="#10b981"
              label="Completion"
              sublabel={`${closedPolls.length} polls completed`}
            />
          </div>
          <div className="an-ring-divider" />
          <div className="an-ring-item">
            <ProgressRing
              pct={
                polls.length > 0
                  ? Math.min(100, Math.round((allVotes / (polls.length * 10)) * 100))
                  : 0
              }
              color="#ec4899"
              label="Vote Density"
              sublabel={`${polls.length > 0 ? Math.round(allVotes / polls.length) : 0} avg per poll`}
            />
          </div>
        </div>
        {polls.length === 0 && (
          <div className="an-empty-rings">
            Not enough data yet — share your polls to collect votes
          </div>
        )}
      </div>

      <div className="an-charts-2col">
        {/* Pie */}
        <div className="an-card">
          <div className="an-c-title">Vote Distribution</div>
          <div className="an-c-sub">Top polls by total votes</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="an-pie-legend">
                {pieData.map((d, i) => (
                  <div key={i} className="an-pie-legend-item">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: d.color,
                        flexShrink: 0,
                      }}
                    />
                    <div className="an-pie-legend-label">{d.name}</div>
                    <div className="an-pie-legend-val">{d.value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="an-empty-chart">
              <div style={{ fontSize: 32, opacity: 0.3 }}>🥧</div>
              <div style={{ fontSize: 13, color: emptyTextColor }}>No votes yet</div>
              <div style={{ fontSize: 11, color: emptySubColor }}>
                Share your polls to start collecting votes
              </div>
            </div>
          )}
        </div>

        <div className="an-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div>
              <div className="an-c-title">Poll Breakdown</div>
              <div className="an-c-sub">Option votes for selected poll</div>
            </div>
            {polls.length > 1 && (
              <select
                className="an-poll-select"
                value={selectedPoll || focusPoll?._id || ""}
                onChange={(e) => setSelectedPoll(e.target.value)}
              >
                {polls.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.question.slice(0, 32)}
                    {p.question.length > 32 ? "…" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          {focusBarData.length > 0 && focusVotes > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={focusBarData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: chartTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: chartTickColorStrong, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="votes" name="votes" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {focusBarData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="an-empty-chart">
              <div style={{ fontSize: 32, opacity: 0.3 }}>📊</div>
              <div style={{ fontSize: 13, color: emptyTextColor }}>
                {focusPoll ? "No votes on this poll yet" : "No polls available"}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="an-card">
        <div className="an-c-title">Poll Performance Table</div>
        <div className="an-c-sub">Detailed stats for each poll</div>
        <div className="an-table">
          <div className="an-table-header">
            <div className="an-th">Poll</div>
            <div className="an-th center">Status</div>
            <div className="an-th center">Votes</div>
            <div className="an-th center">Options</div>
            <div className="an-th center">Top Option</div>
            <div className="an-th center">Avg/Option</div>
          </div>
          {polls.map((poll) => {
            const votes = totalVotes(poll);
            const top = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
            return (
              <div key={poll._id} className="an-table-row">
                <div className="an-td an-td-q">
                  {poll.question.length > 36 ? poll.question.slice(0, 36) + "…" : poll.question}
                </div>
                <div className="an-td center">
                  <span className={`an-status-pill ${poll.isExpired ? "closed" : "active"}`}>
                    {poll.isExpired ? "Closed" : "Active"}
                  </span>
                </div>
                <div className="an-td center an-td-bold">{votes}</div>
                <div className="an-td center">{poll.options.length}</div>
                <div className="an-td center" style={{ color: "#818cf8", fontSize: 12 }}>
                  {top && votes > 0
                    ? `${top.text.slice(0, 16)} (${Math.round((top.votes / votes) * 100)}%)`
                    : "—"}
                </div>
                <div className="an-td center">
                  {poll.options.length > 0 ? Math.round(votes / poll.options.length) : 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
