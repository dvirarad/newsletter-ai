import { TIMEFRAMES, TOPICS } from "../../constants";
import { btnG, tag } from "../../styles";

export default function SettingsStep({ timeframe, setTimeframe, selectedTopics, setSelectedTopics, language, setLanguage, tone, setTone }) {
  return (
    <div>
      <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", color: "#fafaf9" }}>התאמה אישית</h2>
      <p style={{ color: "#a8a29e", fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 }}>הגדירו מה הניוזלטר יכסה ואיך ייכתב.</p>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#fafaf9" }}>📅 טווח זמן</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {TIMEFRAMES.map((tf) => <button key={tf.id} onClick={() => setTimeframe(tf.id)} style={{ ...btnG(timeframe === tf.id), borderRadius: 12, padding: "16px 8px", textAlign: "center" }}><div style={{ fontSize: 22, marginBottom: 6 }}>{tf.icon}</div>{tf.label}</button>)}
        </div>
      </div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#fafaf9" }}>🏷️ נושאים (אופציונלי)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TOPICS.map((t) => <button key={t} onClick={() => setSelectedTopics((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t])} style={tag(selectedTopics.includes(t))}>{t}</button>)}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#fafaf9" }}>🌍 שפה</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ id: "he", l: "עברית" }, { id: "en", l: "English" }].map((x) => <button key={x.id} onClick={() => setLanguage(x.id)} style={{ ...btnG(language === x.id), flex: 1, fontSize: 15 }}>{x.l}</button>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "#fafaf9" }}>🎭 טון</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "casual", l: "קליל" }, { id: "pro", l: "מקצועי" }, { id: "funny", l: "הומוריסטי" }].map((x) => <button key={x.id} onClick={() => setTone(x.id)} style={{ ...btnG(tone === x.id), flex: 1 }}>{x.l}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
}
