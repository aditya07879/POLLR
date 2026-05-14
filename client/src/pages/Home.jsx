import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import FAQ from '../components/FAQ';

/* ── tiny hook: intersection observer for scroll reveals ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── animated number counter ── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── live fake poll ticker ── */
const DEMO_OPTIONS = [
  { label: "Next.js",   pct: 48, votes: 1204 },
  { label: "Remix",     pct: 27, votes:  672 },
  { label: "Nuxt",      pct: 15, votes:  374 },
  { label: "SvelteKit", pct: 10, votes:  253 },
];

function LivePollCard() {
  const [data, setData] = useState(DEMO_OPTIONS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const next = [...prev];
        const i = Math.floor(Math.random() * next.length);
        next[i] = { ...next[i], votes: next[i].votes + Math.floor(Math.random() * 3 + 1) };
        const total = next.reduce((s, o) => s + o.votes, 0);
        return next.map(o => ({ ...o, pct: Math.round((o.votes / total) * 100) }));
      });
      setTick(t => t + 1);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const total = data.reduce((s, o) => s + o.votes, 0);
  const max   = Math.max(...data.map(o => o.votes));

  return (
    <div className="home-demo-card">
      <div className="home-demo-header">
        <div className="home-demo-q">Which framework should we use?</div>
        <div className="home-demo-meta">
          <span className="home-live-badge">
            <span className="home-live-dot" />
            Live
          </span>
          <span className="home-demo-votes">{total.toLocaleString()} votes</span>
        </div>
      </div>
      <div className="home-demo-bars">
        {data.map((opt, i) => (
          <div className="home-demo-bar-row" key={opt.label}>
            <div className="home-demo-bar-label">
              <span className={opt.votes === max ? "home-bar-lead" : "home-bar-norm"}>
                {opt.label}
                {opt.votes === max && <span className="home-leading-pill">Leading</span>}
              </span>
              <span className="home-bar-stat">{opt.pct}%</span>
            </div>
            <div className="home-bar-track">
              <div
                className="home-bar-fill"
                style={{
                  width: `${opt.pct}%`,
                  background: opt.votes === max
                    ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                    : "#e4e4e7",
                  transition: "width .9s cubic-bezier(.25,.46,.45,.94)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="home-demo-footer">
        <span className="home-demo-tick">Updated {tick} times</span>
        <span className="home-share-link">pollr.app/p/framework-vote</span>
      </div>
    </div>
  );
}

/* ── feature card ── */
function FeatureCard({ icon, title, desc, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="home-feat-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity .55s ${delay}ms ease, transform .55s ${delay}ms ease`,
      }}
    >
      <div className="home-feat-icon">{icon}</div>
      <h3 className="home-feat-title">{title}</h3>
      <p className="home-feat-desc">{desc}</p>
    </div>
  );
}

/* ── step ── */
function Step({ n, title, desc, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="home-step"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .6s ${delay}ms ease, transform .6s ${delay}ms ease`,
      }}
    >
      <div className="home-step-num">{n}</div>
      <h4 className="home-step-title">{title}</h4>
      <p className="home-step-desc">{desc}</p>
    </div>
  );
}

/* ── testimonial ── */
function Testimonial({ quote, name, role, avatar, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className="home-testimonial"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity .5s ${delay}ms ease, transform .5s ${delay}ms ease`,
      }}
    >
      <div className="home-quote-mark">"</div>
      <p className="home-quote-text">{quote}</p>
      <div className="home-quote-author">
        <div className="home-avatar">{avatar}</div>
        <div>
          <div className="home-author-name">{name}</div>
          <div className="home-author-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ══ MAIN HOME PAGE ══════════════════════════════════════════ */
export default function Home() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [heroRef, heroVisible] = useReveal();

 

  return (
    <div className="home-root">

      {/* ── NAVBAR ── */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <Link to="/" className="home-nav-logo">
            <span className="home-logo-mark">P</span>
            Pollr
          </Link>
          <div className="home-nav-links">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#how"      className="home-nav-link">How it works</a>
            <a href="#love"     className="home-nav-link">Testimonials</a>
            <a href="#faq" className="home-nav-link">FAQ</a>
            {user ? (
              <Link to="/dashboard" className="home-nav-link">Dashboard</Link>
            ) : (
              <Link to="/signin" className="home-nav-link">Login</Link>
            )}
            {user ? (
              <Link to="/create" className="home-nav-cta">Create poll →</Link>
            ) : (
              <Link to="/signup" className="home-nav-cta">Get started free →</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero">
        {/* background grid */}
        <div className="home-grid-bg" aria-hidden />
        {/* orbs */}
        <div className="home-orb home-orb-1" aria-hidden />
        <div className="home-orb home-orb-2" aria-hidden />

        <div
          ref={heroRef}
          className="home-hero-inner"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(32px)",
            transition: "opacity .8s ease, transform .8s ease",
          }}
        >
          {/* eyebrow */}
          <div className="home-eyebrow">
            <span className="home-eyebrow-dot" />
            Real-time polling platform for 2026
          </div>

          <h1 className="home-headline">
            Opinions move fast.<br />
            <span className="home-headline-grad">Your polls should too.</span>
          </h1>

          <p className="home-subhead">
            Create a poll in seconds. Share one link. Watch votes roll in live —
            no refresh required. Built for teams that move at the speed of decisions.
          </p>

          <div className="home-hero-actions">
            {user ? (
              <Link to="/dashboard" className="home-btn-hero">
                Go to Dashboard
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            ) : (
              <Link to="/signup" className="home-btn-hero">
                Start polling for free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
            )}
            {!user && <Link to="/signin" className="home-btn-ghost">Sign in</Link>}
          </div>

          <div className="home-hero-trust">
            <div className="home-trust-avatars">
              {["A","B","C","D","E"].map((l,i) => (
                <div key={l} className="home-trust-av" style={{ marginLeft: i ? -10 : 0 }}>{l}</div>
              ))}
            </div>
            <span className="home-trust-text">
              Trusted by <strong>12,000+</strong> teams worldwide
            </span>
          </div>
        </div>

        {/* Demo card floats below headline */}
        <div className="home-hero-demo">
          <LivePollCard />
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="home-stats-band">
        {[
          { n: 50000, s: "+", label: "Polls created" },
          { n: 2400000, s: "+", label: "Votes cast" },
          { n: 12000, s: "+", label: "Teams using Pollr" },
          { n: 99, s: "%", label: "Uptime SLA" },
        ].map(({ n, s, label }) => (
          <div className="home-stat" key={label}>
            <div className="home-stat-n">
              <Counter to={n} suffix={s} />
            </div>
            <div className="home-stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className="home-section" id="features">
        <div className="home-section-inner">
          <div className="home-section-label">Features</div>
          <h2 className="home-section-title">Everything a great poll needs</h2>
          <p className="home-section-sub">
            No bloat, no complexity. Just the tools that matter — beautifully crafted.
          </p>
          <div className="home-feat-grid">
            <FeatureCard delay={0}   icon="⚡" title="Instant live results"        desc="Votes appear in real-time via WebSockets. No page refresh, no polling interval — just live." />
            <FeatureCard delay={80}  icon="🔗" title="One shareable link"          desc="Every poll gets a clean slug-based URL. Share it anywhere — Slack, email, socials, QR." />
            <FeatureCard delay={160} icon="⏱" title="Automatic expiry"            desc="Set a deadline and the poll closes itself. Results are preserved forever after." />
            <FeatureCard delay={240} icon="🛡" title="One vote per person"         desc="Built-in duplicate vote prevention keeps results honest without requiring a login to vote." />
            <FeatureCard delay={320} icon="📊" title="Beautiful result bars"       desc="Animated gradient bars, vote counts, percentages and a leading indicator — all at a glance." />
            <FeatureCard delay={400} icon="📱" title="Fully responsive"            desc="Works perfectly on every screen size — mobile, tablet, desktop, and everything in between." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="home-how-section" id="how">
        <div className="home-section-inner">
          <div className="home-section-label">How it works</div>
          <h2 className="home-section-title">Three steps to live results</h2>
          <p className="home-section-sub">
            From idea to insights in under a minute.
          </p>
          <div className="home-steps">
            <Step n="01" delay={0}   title="Write your question"      desc="Type your question, add up to 6 answer options, and set an expiry time. Takes about 20 seconds." />
            <div className="home-step-arrow" aria-hidden>→</div>
            <Step n="02" delay={120} title="Share the link"           desc="Copy your poll's unique URL and drop it anywhere — no account required for voters." />
            <div className="home-step-arrow" aria-hidden>→</div>
            <Step n="03" delay={240} title="Watch results live"       desc="The results page updates in real-time as votes pour in. Share the results link too." />
          </div>
        </div>
      </section>

      {/* ── BENTO SHOWCASE ── */}
      <section className="home-bento-section">
        <div className="home-section-inner">
          <div className="home-section-label">Built different</div>
          <h2 className="home-section-title">Designed for speed & clarity</h2>
          <div className="home-bento">

            <div className="home-bento-card home-bento-large">
              <div className="home-bento-label">Live results</div>
              <div className="home-bento-title">Watch your audience decide — in real time</div>
              <div className="home-bento-bars-mini">
                {[65, 22, 13].map((p, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ height: 8, background: "#f4f4f5", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${p}%`, borderRadius: 99,
                        background: i === 0 ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "#e4e4e7",
                        transition: "width 1s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="home-bento-live-row">
                <span className="home-live-badge"><span className="home-live-dot" />Live</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>247 votes so far</span>
              </div>
            </div>

            <div className="home-bento-card home-bento-sm">
              <div className="home-bento-label">Share anywhere</div>
              <div className="home-bento-title">One link. Every platform.</div>
              <div className="home-bento-link-row">
                <span className="home-share-pill">🔗 pollr.app/p/abc123</span>
              </div>
              <div className="home-platform-icons">
                {["Slack","Email","Tweet","QR"].map(p => (
                  <span key={p} className="home-platform-chip">{p}</span>
                ))}
              </div>
            </div>

            <div className="home-bento-card home-bento-sm">
              <div className="home-bento-label">Auto-expiry</div>
              <div className="home-bento-title">Closes itself when time's up</div>
              <div className="home-countdown-demo">
                <div className="home-countdown-ring">
                  <svg viewBox="0 0 64 64" width="64" height="64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#f4f4f5" strokeWidth="5"/>
                    <circle cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="5"
                      strokeDasharray="176" strokeDashoffset="62" strokeLinecap="round"
                      transform="rotate(-90 32 32)"/>
                  </svg>
                  <span className="home-ring-text">2h 34m</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10, display: "block" }}>
                  Poll closes automatically
                </span>
              </div>
            </div>

            <div className="home-bento-card home-bento-wide">
              <div className="home-bento-label">Dashboard</div>
              <div className="home-bento-title">All your polls in one place</div>
              <div className="home-bento-dash-row">
                {[
                  { q: "Preferred sprint length?", v: 84, active: true },
                  { q: "Lunch order for Friday?",  v: 31, active: true },
                  { q: "Q1 team event location?",  v: 112, active: false },
                ].map(p => (
                  <div key={p.q} className="home-bento-poll-row">
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.q}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:3 }}>{p.v} votes</div>
                    </div>
                    <span className={p.active ? "home-badge-active" : "home-badge-closed"}>
                      {p.active ? "Active" : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="home-section" id="love">
        <div className="home-section-inner">
          <div className="home-section-label">Testimonials</div>
          <h2 className="home-section-title">Teams love Pollr</h2>
          <div className="home-testimonials">
            <Testimonial delay={0}   avatar="PG" name="Piyush Garg"        role="Principal Engineer, Oraczen "       quote="We run weekly team polls for retros and sprint planning. Results show up before everyone's even voted — it's magic." />
            <Testimonial delay={100} avatar="HC" name="Hitesh Chaudhary"     role="CEO , ChaiCode"              quote="I've tried every polling tool. Pollr is the only one that doesn't feel like a form from 2012. The live bar animations are Best" />
            <Testimonial delay={200} avatar="A" name="Anirudh"       role="CTO, Raycast"                      quote="Set up a company-wide poll in 30 seconds. 400 votes in the first hour. The countdown timer keeps urgency high." />
          </div>
        </div>
      </section>

      <FAQ />

      {/* ── CTA BAND ── */}
      <section className="home-cta-section">
        <div className="home-cta-orb" aria-hidden />
        <div className="home-cta-inner">
          <h2 className="home-cta-title">Ready to run your first poll?</h2>
          <p className="home-cta-sub">Free forever. No credit card. Takes 20 seconds to set up.</p>
          <div className="home-cta-actions">
            <Link to="/signup" className="home-btn-hero" style={{ fontSize: 16, padding: "14px 32px" }}>
              Create your first poll
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
          <p className="home-cta-note">No credit card · Free forever · Live in 20 seconds</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <Link to="/" className="home-nav-logo" style={{ marginBottom: 10 }}>
              <span className="home-logo-mark" style={{ width:26,height:26,fontSize:12 }}>P</span>
              Pollr
            </Link>
            <p className="home-footer-tagline">Real-time polls for modern teams.</p>
          </div>
          <div className="home-footer-links">
            <div className="home-footer-col">
              <div className="home-footer-col-title">Product</div>
              <a href="#features" className="home-footer-link">Features</a>
              <a href="#how"      className="home-footer-link">How it works</a>
              <Link to="/signup"  className="home-footer-link">Sign up free</Link>
            </div>
            <div className="home-footer-col">
              <div className="home-footer-col-title">Account</div>
              {user ? (
                <Link to="/dashboard" className="home-footer-link">Dashboard</Link>
              ) : (
                <>
                  <Link to="/signin"  className="home-footer-link">Login</Link>
                  <Link to="/signup"  className="home-footer-link">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>© 2026 Pollr. Built By ADITYA TOMAR for ChaiCode Hackathon.</span>
        </div>
      </footer>

    </div>
  );
}