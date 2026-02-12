import { PROVIDERS } from "../../constants";
import { inp, card, btnG } from "../../styles";

export default function ApiKeyStep({ provider, setProvider, apiKey, setApiKey, selectedModel, setSelectedModel, keyVisible, setKeyVisible, keyValid, validating, error, onValidate }) {
  const P = PROVIDERS[provider];
  return (
    <div>
      <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", color: "#fafaf9" }}>חברו את ה-AI שלכם</h2>
      <p style={{ color: "#a8a29e", fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>הזינו מפתח API. המפתח נשמר בדפדפן בלבד ונשלח ישירות ל-API הרשמי.</p>

      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {Object.values(PROVIDERS).map((p) => (
          <button key={p.id} onClick={() => setProvider(p.id)}
            style={{ flex: 1, background: provider === p.id ? `${p.color}15` : "rgba(255,255,255,0.03)", border: `2px solid ${provider === p.id ? p.color : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "22px 16px", cursor: "pointer", transition: "all .3s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 34, color: provider === p.id ? p.color : "#57534e", transition: "color .3s" }}>{p.icon}</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: provider === p.id ? "#fafaf9" : "#78716c" }}>{p.name}</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
              {p.models.map((m) => <span key={m.id} style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "2px 8px", color: "#a8a29e" }}>{m.label}</span>)}
            </div>
          </button>
        ))}
      </div>

      <div style={{ ...card, padding: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#fafaf9", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: P.color }}>{P.icon}</span> {P.name} API Key
        </div>
        <div style={{ fontSize: 13, color: "#78716c", marginBottom: 16, lineHeight: 1.5 }}>
          {provider === "anthropic"
            ? <>צרו מפתח ב-<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: P.color, textDecoration: "none" }}>console.anthropic.com</a></>
            : <>צרו מפתח ב-<a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: P.color, textDecoration: "none" }}>platform.openai.com</a></>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input type={keyVisible ? "text" : "password"} value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={P.placeholder}
              style={{ ...inp, width: "100%", direction: "ltr", textAlign: "left", paddingLeft: 44, fontFamily: "'JetBrains Mono'", fontSize: 14 }}
              onFocus={(e) => e.target.style.borderColor = `${P.color}80`} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              onKeyDown={(e) => e.key === "Enter" && onValidate()} />
            <button onClick={() => setKeyVisible(!keyVisible)}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#78716c", cursor: "pointer", fontSize: 16 }}>
              {keyVisible ? "🙈" : "👁️"}
            </button>
          </div>
          <button onClick={onValidate} disabled={!apiKey.trim() || validating}
            style={{ ...btnG(true), padding: "14px 28px", opacity: !apiKey.trim() ? 0.4 : 1, cursor: !apiKey.trim() || validating ? "not-allowed" : "pointer" }}>
            {validating ? <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(251,191,36,0.3)", borderTopColor: "#fbbf24", borderRadius: "50%", animation: "spin .6s linear infinite" }} /> : "אמת מפתח"}
          </button>
        </div>

        {keyValid === true && (
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10 }}>
            <span style={{ fontSize: 20, animation: "checkPop .4s ease-out" }}>✅</span>
            <span style={{ color: "#86efac", fontWeight: 500, fontSize: 14 }}>מפתח תקין! מוכנים להמשיך.</span>
          </div>
        )}
        {keyValid === false && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#fca5a5", fontSize: 14 }}>
            ❌ {error || "מפתח לא תקין. בדקו שהעתקתם את המפתח המלא."}
          </div>
        )}

        {keyValid === true && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fafaf9", marginBottom: 10 }}>בחרו מודל</div>
            <div style={{ display: "flex", gap: 10 }}>
              {P.models.map((m) => (
                <button key={m.id} onClick={() => setSelectedModel(m.id)}
                  style={{ flex: 1, background: selectedModel === m.id ? `${P.color}15` : "rgba(255,255,255,0.03)", border: `1px solid ${selectedModel === m.id ? `${P.color}60` : "rgba(255,255,255,0.06)"}`, borderRadius: 12, padding: "14px 12px", cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: selectedModel === m.id ? "#fafaf9" : "#a8a29e" }}>{m.label}</span>
                    {m.badge && <span style={{ fontSize: 10, background: `${P.color}25`, color: P.color, borderRadius: 6, padding: "2px 6px", fontWeight: 700 }}>{m.badge}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#78716c" }}>{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 12, fontSize: 13, color: "#93c5fd", lineHeight: 1.6 }}>
        🔒 <strong>אבטחה:</strong> המפתח נשמר ב-local storage של הדפדפן ונשלח ישירות ל-{provider === "anthropic" ? "api.anthropic.com" : "api.openai.com"}. לא עובר דרך שום שרת ביניים.
      </div>
    </div>
  );
}
