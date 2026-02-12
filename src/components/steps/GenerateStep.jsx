import { PROVIDERS, TIMEFRAMES } from "../../constants";
import { card, btnG, btnSec } from "../../styles";

export default function GenerateStep({ provider, selectedModel, newsletters, sources, timeframe, language, tone, generating, genProgress, result, error, copied, streaming, onGenerate, onDownload, onCopy, onReset, onCancel, onBack }) {
  const P = PROVIDERS[provider];
  return (
    <div>
      <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", color: "#fafaf9" }}>יצירת הניוזלטר</h2>
      <p style={{ color: "#a8a29e", fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>הכל מוכן. ה-AI יסרוק חדשות עדכניות ויכתוב טיוטה בסגנון שלכם.</p>
      <div style={{ ...card, marginBottom: 28, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { l: "ספק", v: `${P.icon} ${P.name}` },
          { l: "מודל", v: P.models.find((m) => m.id === selectedModel)?.label },
          { l: "דוגמאות", v: `${newsletters.length} ניוזלטרים` },
          { l: "מקורות", v: sources.length ? `${sources.length} מקורות` : "אוטומטי" },
          { l: "טווח זמן", v: TIMEFRAMES.find((t) => t.id === timeframe)?.label },
          { l: "שפה / טון", v: `${language === "he" ? "עברית" : "EN"} • ${tone === "casual" ? "קליל" : tone === "pro" ? "מקצועי" : "הומוריסטי"}` },
        ].map((x, i) => <div key={i}><div style={{ fontSize: 11, color: "#78716c", marginBottom: 3, fontFamily: "'JetBrains Mono'", letterSpacing: 1 }}>{x.l}</div><div style={{ fontSize: 15, fontWeight: 600, color: "#fafaf9" }}>{x.v}</div></div>)}
      </div>

      {!result && !generating && (
        <button onClick={onGenerate}
          style={{ width: "100%", background: `linear-gradient(135deg,${P.color},#fbbf24)`, color: "#0f0f1a", border: "none", padding: 20, fontSize: 18, fontWeight: 700, fontFamily: "'Rubik'", borderRadius: 14, cursor: "pointer", boxShadow: `0 4px 24px ${P.color}50`, transition: "all .3s" }}
          onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 40px ${P.color}70`; }}
          onMouseLeave={(e) => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 4px 24px ${P.color}50`; }}
        >🚀 צרו את הניוזלטר שלי</button>
      )}

      {generating && (
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ width: `${genProgress}%`, height: "100%", background: `linear-gradient(90deg,${P.color},#fbbf24)`, borderRadius: 3, transition: "width .5s" }} />
          </div>
          {streaming && result ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, fontSize: 15, lineHeight: 1.8, color: "#d6d3d1", maxHeight: "50vh", overflowY: "auto", textAlign: "right", whiteSpace: "pre-wrap", marginBottom: 16 }}>
              {result}
              <span style={{ display: "inline-block", width: 8, height: 18, background: "#fbbf24", animation: "spin 1s step-end infinite", marginRight: 2 }} />
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fbbf24", marginBottom: 8 }}>
                {genProgress < 20 ? "📡 מכין חומרים..." : genProgress < 60 ? "🔍 סורק חדשות..." : genProgress < 90 ? "✍️ כותב..." : "✨ מלטש..."}
              </div>
              <div style={{ fontSize: 13, color: "#78716c" }}>30-60 שניות</div>
            </>
          )}
          <button onClick={onCancel} style={{ ...btnSec, marginTop: 12 }}>ביטול</button>
        </div>
      )}

      {error && <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#fca5a5", fontSize: 14 }}>{error}</div>}

      {result && !generating && (
        <div style={{ animation: "fadeInUp .6s ease-out" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>✅ הניוזלטר מוכן!</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onDownload} style={btnG(true)}>⬇ הורדה</button>
              <button onClick={onCopy} style={btnSec}>{copied ? "✓ הועתק!" : "📋 העתקה"}</button>
              <button onClick={onReset} style={btnSec}>🔄 מחדש</button>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32, fontSize: 15, lineHeight: 1.8, color: "#d6d3d1", maxHeight: "70vh", overflowY: "auto" }}
            dangerouslySetInnerHTML={{ __html: result
              .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
              .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color:#fbbf24;text-decoration:none;border-bottom:1px solid rgba(251,191,36,0.3)">$1</a>')
              .replace(/\n/g, "<br/>")
            }} />
        </div>
      )}

      {!generating && !result && (
        <div style={{ marginTop: 24 }}><button onClick={onBack} style={btnSec}>→ חזרה</button></div>
      )}
    </div>
  );
}
