import { PROVIDERS } from "../constants";
import { ctn, card } from "../styles";
import Particle from "./Particle";

export default function Landing({ onStart }) {
  return (
    <>
      {[10, 25, 40, 55, 70, 85].map((x, i) => <Particle key={i} x={x} delay={i * 3} size={`${20 + i * 8}px`} />)}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60vh", background: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ ...ctn, paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ textAlign: "center", animation: "fadeInUp .8s ease-out" }}>
          <div style={{ display: "inline-block", background: "linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", fontSize: 14, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>Newsletter Generator</div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(42px,7vw,72px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 24px", color: "#fafaf9" }}>
            הניוזלטר שלך.<br />
            <span style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)", backgroundSize: "200% auto", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", animation: "gradientShift 4s ease infinite" }}>הסגנון שלך.</span><br />
            בלחיצת כפתור.
          </h1>
          <p style={{ fontSize: 19, color: "#a8a29e", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7 }}>
            העלו דוגמאות של ניוזלטרים קודמים, הגדירו מקורות ונושאים, ותקבלו טיוטת ניוזלטר מלאה — בדיוק בסגנון הכתיבה שלכם.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
            {Object.values(PROVIDERS).map((p) => (
              <button key={p.id} onClick={() => onStart(p.id)}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "22px 40px", cursor: "pointer", transition: "all .3s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 190 }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = `${p.color}10`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; }}
              >
                <span style={{ fontSize: 30, color: p.color }}>{p.icon}</span>
                <span style={{ fontSize: 17, fontWeight: 600, color: "#fafaf9" }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "#78716c" }}>התחלה עם {p.id === "anthropic" ? "Claude" : "GPT"}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 60, animation: "fadeInUp .8s ease-out .3s both" }}>
          <h2 style={{ textAlign: "center", fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 700, marginBottom: 48, color: "#fafaf9" }}>איך זה עובד?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16 }}>
            {[
              { n: "01", i: "🔑", t: "חברו API", d: "הזינו מפתח של Claude או OpenAI." },
              { n: "02", i: "✍️", t: "העלו דוגמאות", d: "3-10 ניוזלטרים. ה-AI ילמד את הסגנון." },
              { n: "03", i: "🔗", t: "מקורות", d: "הוסיפו אתרים או חפשו חדשים." },
              { n: "04", i: "⚙️", t: "התאימו", d: "טווח זמן, נושאים, שפה וטון." },
              { n: "05", i: "🚀", t: "צרו!", d: "טיוטה מלאה בסגנון שלכם." },
            ].map((x, i) => (
              <div key={i} style={{ ...card, padding: 24, transition: "all .3s", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(251,191,36,0.05)"; e.currentTarget.style.borderColor = "rgba(251,191,36,0.2)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{x.i}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", letterSpacing: 2, marginBottom: 6, fontFamily: "'JetBrains Mono'" }}>STEP {x.n}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#fafaf9" }}>{x.t}</div>
                <div style={{ fontSize: 13, color: "#a8a29e", lineHeight: 1.5 }}>{x.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 60, textAlign: "center", animation: "fadeInUp .8s ease-out .5s both" }}>
          <div style={{ display: "inline-block", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 14, padding: "20px 36px" }}>
            <div style={{ fontSize: 14, color: "#a8a29e", marginBottom: 4 }}>עלות משוערת ליצירת ניוזלטר</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24", fontFamily: "'JetBrains Mono'" }}>~$0.15 - $0.40</div>
            <div style={{ fontSize: 13, color: "#78716c", marginTop: 4 }}>תלוי במודל ובכמות הדוגמאות</div>
          </div>
        </div>
      </div>
    </>
  );
}
