import { useRef } from "react";

export default function UploadStep({ newsletters, error, onFiles, onRemove }) {
  const fileRef = useRef(null);
  return (
    <div>
      <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", color: "#fafaf9" }}>העלו ניוזלטרים לדוגמה</h2>
      <p style={{ color: "#a8a29e", fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>העלו 3-10 ניוזלטרים קודמים. ה-AI ינתח את סגנון הכתיבה, המבנה והטון.</p>
      <input ref={fileRef} type="file" multiple accept=".txt,.html,.htm,.md,.pdf,.eml" onChange={onFiles} style={{ display: "none" }} />
      <div onClick={() => fileRef.current?.click()}
        style={{ border: "2px dashed rgba(251,191,36,0.25)", borderRadius: 16, padding: 48, textAlign: "center", cursor: "pointer", transition: "all .3s", background: "rgba(251,191,36,0.02)" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.5)"; e.currentTarget.style.background = "rgba(251,191,36,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; e.currentTarget.style.background = "rgba(251,191,36,0.02)"; }}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#fbbf24"; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; }}
        onDrop={(e) => { e.preventDefault(); onFiles(e); e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: "#fafaf9", marginBottom: 8 }}>גררו קבצים לכאן או לחצו</div>
        <div style={{ fontSize: 13, color: "#78716c" }}>TXT, HTML, MD, PDF, EML • מינימום 3, מקסימום 10</div>
      </div>
      {error && <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#fca5a5", fontSize: 14 }}>{error}</div>}
      {newsletters.length > 0 && (<div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, color: "#a8a29e", marginBottom: 12, fontFamily: "'JetBrains Mono'" }}>{newsletters.length}/10 קבצים</div>
        {newsletters.map((n, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#22c55e" }}>✓</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{n.name}</span>
              <span style={{ fontSize: 12, color: "#78716c", fontFamily: "'JetBrains Mono'" }}>{(n.size / 1024).toFixed(1)}KB</span>
            </div>
            <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        ))}
      </div>)}
      {newsletters.length > 0 && newsletters.length < 3 && (
        <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.12)", borderRadius: 10, color: "#fbbf24", fontSize: 14 }}>
          ⚠️ העלו לפחות 3 כדי להמשיך ({3 - newsletters.length} חסרים)
        </div>
      )}
    </div>
  );
}
