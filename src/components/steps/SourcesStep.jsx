import { inp, card, btnG } from "../../styles";

export default function SourcesStep({ sources, setSources, sourceInput, setSourceInput, searchQuery, setSearchQuery, searchResults, searching, onSearch, onAddSource }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", color: "#fafaf9" }}>הגדירו מקורות</h2>
      <p style={{ color: "#a8a29e", fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>הוסיפו אתרים או חפשו חדשים. לא חובה — בלי מקורות ה-AI ישתמש במקורות מובילים.</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input value={sourceInput} onChange={(e) => setSourceInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAddSource()}
          placeholder="הוסיפו URL (למשל techcrunch.com)" style={{ ...inp, direction: "ltr" }}
          onFocus={(e) => e.target.style.borderColor = "rgba(251,191,36,0.4)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
        <button onClick={onAddSource} style={btnG(true)}>+ הוסף</button>
      </div>
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#fafaf9" }}>🔍 חפשו מקורות באינטרנט</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder='"AI news blogs" או "בלוגים ישראליים טכנולוגיה"' style={{ ...inp, fontSize: 14 }}
            onFocus={(e) => e.target.style.borderColor = "rgba(251,191,36,0.4)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          <button onClick={onSearch} disabled={searching} style={{ ...btnG(true), opacity: searching ? .6 : 1 }}>
            {searching ? "מחפש..." : "חפש"}
          </button>
        </div>
        {searchResults.length > 0 && <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          {searchResults.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 14px" }}>
              <div><div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div><div style={{ fontSize: 12, color: "#78716c", direction: "ltr", textAlign: "right" }}>{r.url}</div></div>
              <button onClick={() => { if (!sources.includes(r.url)) setSources((p) => [...p, r.url]); }}
                style={{ background: sources.includes(r.url) ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.12)", border: "none", borderRadius: 8, padding: "6px 14px", color: sources.includes(r.url) ? "#22c55e" : "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Rubik'" }}>
                {sources.includes(r.url) ? "✓ נוסף" : "+ הוסף"}
              </button>
            </div>
          ))}
        </div>}
      </div>
      {sources.length > 0 && <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#fafaf9" }}>מקורות ({sources.length})</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sources.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 20, padding: "6px 14px", fontSize: 13, color: "#fbbf24", direction: "ltr" }}>
              {s.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
              <span onClick={() => setSources((p) => p.filter((_, j) => j !== i))} style={{ cursor: "pointer", opacity: .6, fontSize: 16 }}>×</span>
            </div>
          ))}
        </div>
      </div>}
    </div>
  );
}
