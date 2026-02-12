import { btnSec } from "../styles";
import { canNext } from "../utils";

export default function WizardNav({ step, setStep, keyValid, newsletterCount }) {
  const ok = canNext(step, { keyValid, newsletterCount });
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <button onClick={() => setStep((s) => s - 1)} style={btnSec}>{step === 1 ? "→ דף ראשי" : "→ חזרה"}</button>
      <button onClick={() => setStep((s) => s + 1)} disabled={!ok}
        style={{ background: ok ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "12px 32px", color: ok ? "#0f0f1a" : "#57534e", fontSize: 15, fontWeight: 700, cursor: ok ? "pointer" : "not-allowed", fontFamily: "'Rubik'", boxShadow: ok ? "0 4px 16px rgba(251,191,36,0.25)" : "none", transition: "all .3s" }}>
        {step === 4 ? "← ליצירה" : "← המשך"}
      </button>
    </div>
  );
}
