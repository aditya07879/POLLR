import { useState } from "react";

const FAQ_ITEMS = [
  { q: "What is Pollr?",
     a: "Pollr is a real-time online polling app. Create a poll in seconds, share one link, and watch votes roll in live — no page refresh needed." },
  { q: "Do I need an account to vote?",
    a: "No! Voting is completely public and requires no login. Anyone with the poll link can cast their vote instantly." },
  { q: "How do I create a poll?",
    a: "Sign up or log in, click 'Create Poll', add your question and up to 6 options, then set an expiry date. You get a unique shareable link right away." },
  { q: "How does duplicate vote prevention work?", 
    a: "We store a unique voter token in your browser's localStorage. Each browser can only vote once per poll — no sign-in required, and results stay honest." },
  { q: "Are results really live?", 
    a: "Yes! Results update in real-time via Socket.IO WebSockets. Every vote instantly reflects on the bar chart for all viewers — zero refresh needed." },
  { q: "What happens when a poll expires?", 
    a: "Expired polls stop accepting votes both server-side and client-side. Final results are preserved forever after the deadline." },
  { q: "Can I delete my polls?", 
    a: "Yes. From your dashboard you can view, manage, and delete any poll you've created. Only the poll creator can delete it." },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  return (
    <section className="home-faq-section" id="faq">
      <div className="home-section-inner">
        <div className="home-section-label">FAQ</div>
        <h2 className="home-section-title">Frequently asked questions</h2>
        <p className="home-section-sub">Everything you need to know about Pollr.</p>
        <div className="home-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`home-faq-item${open === i ? " open" : ""}`}>
              <button className="home-faq-btn" onClick={() => toggle(i)}>
                <span className="home-faq-q">{item.q}</span>
                <span className="home-faq-icon">{open === i ? "−" : "+"}</span>
              </button>
              <div className="home-faq-body" style={{ maxHeight: open === i ? 300 : 0 }}>
                <p className="home-faq-a">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}