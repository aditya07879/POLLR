import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function useCountUp(target, duration = 1200, started = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started || target === 0) {
      setVal(target);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, started]);
  return val;
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

function EmptyChart({ message, sub }) {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  const msgColor = isDark ? "rgba(255,255,255,.4)" : "rgba(30,27,75,.4)";
  const subColor = isDark ? "rgba(255,255,255,.22)" : "rgba(30,27,75,.28)";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 190,
        gap: 10,
      }}
    >
      <div style={{ fontSize: 36, opacity: 0.3 }}>📈</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: msgColor }}>{message}</div>
      {sub && <div style={{ fontSize: 11, color: subColor }}>{sub}</div>}
    </div>
  );
}

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

function buildChartData(polls, filter) {
  const now = new Date();
  let buckets = [];

  if (filter === "daily") {
    // 24 hours in 2h buckets
    for (let h = 0; h < 24; h += 2) {
      buckets.push({
        label: `${h}:00`,
        votes: 0,
        polls: 0,
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h + 2),
      });
    }
  } else if (filter === "weekly") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(now.getDate() - d);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      buckets.push({ label: days[date.getDay()], votes: 0, polls: 0, start, end });
    }
  } else {
    // monthly - 4 weeks
    for (let w = 3; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(now.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      buckets.push({ label: `W${4 - w}`, votes: 0, polls: 0, start, end });
    }
  }

  polls.forEach((poll) => {
    const created = new Date(poll.createdAt);
    const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);
    buckets.forEach((b) => {
      if (created >= b.start && created < b.end) {
        b.polls += 1;
        b.votes += totalVotes;
      }
    });
  });

  return buckets.map((b) => ({ day: b.label, votes: b.votes, polls: b.polls }));
}

export default function Overview({ polls, loading, filter, animStarted }) {
  const navigate = useNavigate();
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  const chartTickColor = isLight ? "rgba(30,27,75,.5)" : "rgba(255,255,255,.32)";
  const chartGridColor = isLight ? "rgba(99,102,241,.1)" : "rgba(255,255,255,.05)";

  const totalVotes = (poll) => poll.options.reduce((s, o) => s + o.votes, 0);
  const activePolls = polls.filter((p) => !p.isExpired);
  const closedPolls = polls.filter((p) => p.isExpired);
  const allVotes = polls.reduce((s, p) => s + totalVotes(p), 0);
  const mostPopular =
    polls.length > 0
      ? polls.reduce((best, p) => (totalVotes(p) > totalVotes(best) ? p : best), polls[0])
      : null;
  const engagementRate = polls.length ? Math.round((activePolls.length / polls.length) * 100) : 0;

  const chartData = useMemo(() => buildChartData(polls, filter), [polls, filter]);
  const hasChartData = chartData.some((d) => d.votes > 0 || d.polls > 0);

  const recentActivity = [...polls]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const topOptions = polls
    .flatMap((p) => p.options.map((o) => ({ text: o.text, votes: o.votes, poll: p.question })))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981"];

  const cTotal = useCountUp(polls.length, 1000, animStarted);
  const cActive = useCountUp(activePolls.length, 1000, animStarted);
  const cVotes = useCountUp(allVotes, 1200, animStarted);
  const cEngagement = useCountUp(engagementRate, 1000, animStarted);

  const statCards = [
    { label: "Total Polls", val: cTotal, icon: "◈", accent: "#6366f1", badge: "all time" },
    { label: "Active Now", val: cActive, icon: "◉", accent: "#10b981", badge: "collecting votes" },
    { label: "Total Votes", val: cVotes, icon: "✦", accent: "#06b6d4", badge: "across all polls" },
    {
      label: "Active Rate",
      val: cEngagement + "%",
      icon: "⬡",
      accent: "#ec4899",
      badge: "engagement",
      raw: true,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} h={110} r={18} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Skeleton h={230} r={18} />
          <Skeleton h={230} r={18} />
        </div>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="ov-empty-wrap">
        <div className="ov-empty-ico">📊</div>
        <div className="ov-empty-h">Your analytics start here</div>
        <div className="ov-empty-p">
          Create your first poll and watch live votes roll in. Charts, trends, and insights — all
          waiting for real data.
        </div>
        <Link to="/create" className="ov-cta-btn">
          ✦ Create First Poll
        </Link>
      </div>
    );
  }

  return (
    <div className="ov-root">
      {/* Stat Cards */}
      <div className="ov-stats-grid">
        {statCards.map((s, i) => (
          <div key={s.label} className="ov-stat-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="ov-stat-ico" style={{ background: `${s.accent}22`, color: s.accent }}>
              {s.icon}
            </div>
            <div className="ov-stat-num">{s.raw ? s.val : s.val}</div>
            <div className="ov-stat-lbl">{s.label}</div>
            <div className="ov-stat-badge" style={{ color: s.accent, background: `${s.accent}14` }}>
              {s.badge}
            </div>
          </div>
        ))}
      </div>

      <div className="ov-charts-2col">
        <div className="ov-card">
          <div className="ov-c-title">Vote Trend</div>
          <div className="ov-c-sub">Votes collected — {filter} view</div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: chartTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="votes"
                  name="votes"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#aGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              message="No voting activity this period"
              sub="Votes will appear here once users participate"
            />
          )}
        </div>

        <div className="ov-card">
          <div className="ov-c-title">Polls Created</div>
          <div className="ov-c-sub">New polls — {filter} view</div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: chartTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="polls" name="polls" fill="url(#bGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart
              message="No polls created this period"
              sub={`Switch to 'Monthly' to see older data`}
            />
          )}
        </div>
      </div>

      <div className="ov-activity-row">
        <div className="ov-card">
          <div className="ov-c-title">Recent Activity</div>
          <div className="ov-c-sub">Latest poll events</div>
          {recentActivity.length > 0 ? (
            recentActivity.map((poll) => (
              <div key={poll._id} className="ov-act-item">
                <div
                  className="ov-act-dot"
                  style={{ background: poll.isExpired ? "#6366f1" : "#10b981" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ov-act-q">
                    {poll.question.length > 40 ? poll.question.slice(0, 40) + "…" : poll.question}
                  </div>
                  <div className="ov-act-meta">
                    {new Date(poll.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {totalVotes(poll)} votes ·{" "}
                    <span style={{ color: poll.isExpired ? "#f87171" : "#10b981" }}>
                      {poll.isExpired ? "closed" : "active"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ov-empty-inline">No activity yet</div>
          )}
        </div>

        <div className="ov-card">
          <div className="ov-c-title">🏆 Top Options</div>
          <div className="ov-c-sub">Most voted choices across all polls</div>
          {topOptions.length > 0 ? (
            topOptions.map((item, i) => {
              const maxV = topOptions[0]?.votes || 1;
              const pct = Math.round((item.votes / maxV) * 100);
              const rankColors = ["#f59e0b", "#94a3b8", "#b45309", "#6366f1", "#8b5cf6"];
              return (
                <div key={i} className="ov-lb-row">
                  <div className="ov-lb-rank" style={{ color: rankColors[i] }}>
                    #{i + 1}
                  </div>
                  <div className="ov-lb-text" title={item.text}>
                    {item.text}
                  </div>
                  <div className="ov-lb-bar-bg">
                    <div
                      className="ov-lb-bar-fill"
                      style={{
                        width: animStarted ? pct + "%" : "0%",
                        background: `linear-gradient(90deg,${rankColors[i]},${COLORS[(i + 1) % COLORS.length]})`,
                      }}
                    />
                  </div>
                  <div className="ov-lb-v">{item.votes}</div>
                </div>
              );
            })
          ) : (
            <div className="ov-empty-inline">No votes yet — share your polls!</div>
          )}
        </div>
      </div>
    </div>
  );
}
