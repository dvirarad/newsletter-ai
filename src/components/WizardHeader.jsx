import { STEPS } from "../constants";

export default function WizardHeader({ step, setStep, onClearSettings }) {
  return (
    <div style={{ padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div onClick={() => setStep(0)} style={{ cursor: "pointer", fontFamily: "'Frank Ruhl Libre'", fontSize: 22, fontWeight: 700, color: "#fbbf24" }}>Newsletter AI</div>
        {onClearSettings && (
          <button onClick={onClearSettings} title="נקה הגדרות שמורות"
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 10px", color: "#78716c", fontSize: 11, cursor: "pointer", fontFamily: "'Rubik'", transition: "all .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#78716c"; }}
          >🗑 נקה נתונים</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {STEPS.map((s) => (
          <div key={s.id} onClick={() => s.id < step && setStep(s.id)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 10px", borderRadius: 10, fontSize: 12, fontWeight: step === s.id ? 600 : 400, color: step === s.id ? "#fbbf24" : step > s.id ? "#a8a29e" : "#57534e", background: step === s.id ? "rgba(251,191,36,0.1)" : "transparent", cursor: s.id < step ? "pointer" : "default", transition: "all .2s" }}>
            <span>{s.icon}</span><span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
