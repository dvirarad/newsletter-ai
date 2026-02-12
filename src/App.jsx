import { useState, useRef, useEffect } from "react";

const STEPS = [
  { id: 1, label: "חיבור", icon: "🔑" },
  { id: 2, label: "סגנון", icon: "✍️" },
  { id: 3, label: "מקורות", icon: "🔗" },
  { id: 4, label: "הגדרות", icon: "⚙️" },
  { id: 5, label: "יצירה", icon: "🚀" },
];

const TIMEFRAMES = [
  { id: "1d", label: "24 שעות אחרונות", icon: "⚡" },
  { id: "3d", label: "3 ימים אחרונים", icon: "📅" },
  { id: "1w", label: "שבוע אחרון", icon: "📰" },
  { id: "2w", label: "שבועיים", icon: "📚" },
];

const TOPICS = [
  "מודלים חדשים (LLMs)", "AI וביטחון סייבר", "רגולציה ומשפט", "AI בבריאות",
  "סטארטאפים וגיוסים", "כלים ומוצרים חדשים", "AI ותעסוקה", "רובוטיקה", "AI בישראל", "אתיקה ובטיחות",
];

const PROVIDERS = {
  anthropic: {
    id: "anthropic", name: "Claude (Anthropic)", icon: "✦", color: "#d4a574",
    placeholder: "sk-ant-api03-...", prefix: "sk-ant-",
    models: [
      { id: "claude-sonnet-4-5-20250929", label: "Sonnet 4.5", desc: "מהיר וחסכוני", badge: "מומלץ" },
      { id: "claude-opus-4-6", label: "Opus 4.6", desc: "החכם ביותר", badge: null },
    ],
  },
  openai: {
    id: "openai", name: "GPT (OpenAI)", icon: "◈", color: "#74aa9c",
    placeholder: "sk-proj-...", prefix: "sk-",
    models: [
      { id: "gpt-4o", label: "GPT-4o", desc: "מהיר ומדויק", badge: "מומלץ" },
      { id: "gpt-4.1", label: "GPT-4.1", desc: "הדור החדש", badge: null },
    ],
  },
};

function Particle({ delay, x, size }) {
  return <div style={{ position: "absolute", left: `${x}%`, bottom: -20, width: size, height: size, borderRadius: "50%", background: "rgba(251,191,36,0.08)", animation: `floatUp 18s ${delay}s infinite linear`, pointerEvents: "none" }} />;
}

export default function App() {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-5-20250929");
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyValid, setKeyValid] = useState(null);
  const [validating, setValidating] = useState(false);
  const [newsletters, setNewsletters] = useState([]);
  const [sources, setSources] = useState([]);
  const [sourceInput, setSourceInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [timeframe, setTimeframe] = useState("1w");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [language, setLanguage] = useState("he");
  const [tone, setTone] = useState("casual");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [genProgress, setGenProgress] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&family=Frank+Ruhl+Libre:wght@300;400;500;700;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
      @keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:.4}90%{opacity:.1}100%{transform:translateY(-100vh) scale(.3);opacity:0}}
      @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      *{box-sizing:border-box}body{margin:0}
      ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0f0f1a}::-webkit-scrollbar-thumb{background:#fbbf24;border-radius:3px}
      input::placeholder{color:#57534e}
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    setSelectedModel(PROVIDERS[provider].models[0].id);
    setKeyValid(null);
    setError("");
  }, [provider]);

  const P = PROVIDERS[provider];

  const validateKey = async () => {
    if (!apiKey.trim()) return;
    setValidating(true); setKeyValid(null); setError("");
    try {
      if (provider === "anthropic") {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey.trim(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({ model: "claude-sonnet-4-5-20250929", max_tokens: 10, messages: [{ role: "user", content: "Say OK" }] }),
        });
        if (r.ok || r.status === 429) { setKeyValid(true); }
        else { const d = await r.json().catch(() => ({})); setKeyValid(false); setError(d?.error?.message || "מפתח לא תקין"); }
      } else {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
          body: JSON.stringify({ model: "gpt-4o", max_tokens: 10, messages: [{ role: "user", content: "Say OK" }] }),
        });
        if (r.ok || r.status === 429) { setKeyValid(true); }
        else { const d = await r.json().catch(() => ({})); setKeyValid(false); setError(d?.error?.message || "מפתח לא תקין"); }
      }
    } catch (e) { setKeyValid(false); setError("שגיאת רשת: " + e.message); }
    setValidating(false);
  };

  const callLLM = async (sys, usr, search = false) => {
    if (provider === "anthropic") {
      const body = { model: selectedModel, max_tokens: 4000, system: sys, messages: [{ role: "user", content: usr }] };
      if (search) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey.trim(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify(body),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d?.error?.message || `Error ${r.status}`); }
      const data = await r.json();
      return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
    } else {
      const body = { model: selectedModel, max_tokens: 4000, messages: [{ role: "system", content: sys }, { role: "user", content: usr }] };
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify(body),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d?.error?.message || `Error ${r.status}`); }
      const data = await r.json();
      return data.choices?.[0]?.message?.content || "";
    }
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target?.files || e.dataTransfer?.files || []);
    if (newsletters.length + files.length > 10) { setError("ניתן להעלות עד 10 ניוזלטרים"); return; }
    setError("");
    for (const f of files) {
      const txt = await f.text();
      setNewsletters((p) => [...p, { name: f.name, content: txt.slice(0, 15000), size: f.size }]);
    }
    if (e.target?.value) e.target.value = "";
  };

  const addSource = () => { if (!sourceInput.trim()) return; if (!sources.includes(sourceInput.trim())) setSources((p) => [...p, sourceInput.trim()]); setSourceInput(""); };

  const searchSources = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setSearchResults([]);
    try {
      const txt = await callLLM("Return ONLY a JSON array of {name, url} objects. No markdown.", `Find 6-8 RSS feeds or news sources about: ${searchQuery}`, true);
      const clean = txt.replace(/```json|```/g, "").trim();
      try { const r = JSON.parse(clean); setSearchResults(Array.isArray(r) ? r : []); } catch { setSearchResults([]); }
    } catch (e) { setError("שגיאה בחיפוש: " + e.message); }
    setSearching(false);
  };

  const generate = async () => {
    setGenerating(true); setResult(""); setGenProgress(0); setError("");
    const examples = newsletters.map((n, i) => `=== דוגמה ${i + 1}: ${n.name} ===\n${n.content.slice(0, 4000)}`).join("\n\n");
    const tf = TIMEFRAMES.find((t) => t.id === timeframe)?.label || "שבוע";
    const lang = language === "he" ? "עברית" : "אנגלית";
    const tn = tone === "casual" ? "קליל ואישי" : tone === "pro" ? "מקצועי" : "הומוריסטי";
    const sys = `You are an expert AI newsletter writer. Analyze style from examples, search latest AI news, write a complete newsletter in that exact style.\nRules:\n- Write in ${lang}, Tone: ${tn}\n- Match structure, sections, formatting and voice EXACTLY\n- Real current news from ${tf}\n- Focus: ${selectedTopics.length ? selectedTopics.join(", ") : "all relevant AI topics"}\n- Authentic, personal, not generated-sounding\n- Numbered news, deep dives, tool recs, closing meme\n- Hebrew: natural spoken, not academic\n\nCRITICAL - SOURCE LINKS:\n- Every news item MUST include at least one source link in markdown format: [source name](URL)\n- Place the link naturally at the end of each item, e.g. "([מקור](https://...))" or "קראו עוד: [TechCrunch](https://...)"\n- For deep-dive sections ("שלושה דברים גדולים" or equivalent), include 1-2 links per story\n- For short news items ("חדשות בקצרה" or equivalent), include at least 1 link each\n- For tool/product recommendations, link directly to the product page\n- Use REAL URLs from your web search results — never make up URLs\n- Prefer original sources (company blogs, official announcements) over aggregators`;
    const usr = `Examples:\n\n${examples}\n\nSources: ${sources.length ? sources.join("\n") : "Best AI news sources"}\n\nWrite FULL newsletter for today (${new Date().toLocaleDateString("he-IL")}) covering AI news from ${tf}. All sections.\n\nREMINDER: Every news item must include at least one real source link in [name](url) markdown format. Use the URLs from your web search.`;
    try {
      setGenProgress(15);
      const txt = await callLLM(sys, usr, true);
      setGenProgress(95);
      setResult(txt);
      setGenProgress(100);
    } catch (e) { setError("שגיאה ביצירת הניוזלטר: " + e.message); }
    setGenerating(false);
  };

  const download = () => {
    const b = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = u; a.download = `newsletter-${new Date().toISOString().split("T")[0]}.md`; a.click();
    URL.revokeObjectURL(u);
  };

  const canNext = (s) => {
    if (s === 1) return keyValid === true;
    if (s === 2) return newsletters.length >= 3;
    return true;
  };

  // ─── Shared styles ───
  const bg = { minHeight: "100vh", background: "#0f0f1a", color: "#e8e6e1", fontFamily: "'Rubik', sans-serif", direction: "rtl", position: "relative", overflow: "hidden" };
  const ctn = { maxWidth: 860, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 2 };
  const inp = { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 16px", color: "#e8e6e1", fontSize: 15, fontFamily: "'Rubik', sans-serif", outline: "none" };
  const btnSec = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 28px", color: "#a8a29e", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'Rubik', sans-serif" };
  const btnG = (on) => ({ background: on ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${on ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "14px 20px", color: on ? "#fbbf24" : "#a8a29e", fontWeight: on ? 600 : 400, fontSize: 14, cursor: "pointer", fontFamily: "'Rubik', sans-serif", transition: "all .2s" });
  const h2s = { fontFamily: "'Frank Ruhl Libre', serif", fontSize: 36, fontWeight: 800, margin: "0 0 12px", color: "#fafaf9" };
  const sub = { color: "#a8a29e", fontSize: 16, margin: "0 0 32px", lineHeight: 1.6 };
  const card = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 24 };
  const tag = (on, col = "#fbbf24") => ({ display: "flex", alignItems: "center", gap: 8, background: on ? `${col}12` : "rgba(255,255,255,0.03)", border: `1px solid ${on ? `${col}35` : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: "8px 18px", color: on ? col : "#a8a29e", fontSize: 14, cursor: "pointer", fontFamily: "'Rubik'", transition: "all .2s" });

  // ─── LANDING ───
  if (step === 0) {
    return (
      <div style={bg}>
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
                <button key={p.id} onClick={() => { setProvider(p.id); setStep(1); }}
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
      </div>
    );
  }

  // ─── WIZARD ───
  return (
    <div style={bg}>
      {[15, 45, 75].map((x, i) => <Particle key={i} x={x} delay={i * 5} size={`${15 + i * 6}px`} />)}
      <div style={ctn}>
        {/* Header */}
        <div style={{ padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: 8 }}>
          <div onClick={() => setStep(0)} style={{ cursor: "pointer", fontFamily: "'Frank Ruhl Libre'", fontSize: 22, fontWeight: 700, color: "#fbbf24" }}>Newsletter AI</div>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            {STEPS.map((s) => (
              <div key={s.id} onClick={() => s.id < step && setStep(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 10px", borderRadius: 10, fontSize: 12, fontWeight: step === s.id ? 600 : 400, color: step === s.id ? "#fbbf24" : step > s.id ? "#a8a29e" : "#57534e", background: step === s.id ? "rgba(251,191,36,0.1)" : "transparent", cursor: s.id < step ? "pointer" : "default", transition: "all .2s" }}>
                <span>{s.icon}</span><span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: 48, paddingBottom: 80, animation: "fadeInUp .5s ease-out" }} key={step}>

          {/* ─── STEP 1: API KEY ─── */}
          {step === 1 && (<div>
            <h2 style={h2s}>חברו את ה-AI שלכם</h2>
            <p style={sub}>הזינו מפתח API. המפתח נשמר בדפדפן בלבד ונשלח ישירות ל-API הרשמי.</p>

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
                    onChange={(e) => { setApiKey(e.target.value); setKeyValid(null); setError(""); }}
                    placeholder={P.placeholder}
                    style={{ ...inp, width: "100%", direction: "ltr", textAlign: "left", paddingLeft: 44, fontFamily: "'JetBrains Mono'", fontSize: 14 }}
                    onFocus={(e) => e.target.style.borderColor = `${P.color}80`} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    onKeyDown={(e) => e.key === "Enter" && validateKey()} />
                  <button onClick={() => setKeyVisible(!keyVisible)}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#78716c", cursor: "pointer", fontSize: 16 }}>
                    {keyVisible ? "🙈" : "👁️"}
                  </button>
                </div>
                <button onClick={validateKey} disabled={!apiKey.trim() || validating}
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
              🔒 <strong>אבטחה:</strong> המפתח נשמר רק בזיכרון הדפדפן ונשלח ישירות ל-{provider === "anthropic" ? "api.anthropic.com" : "api.openai.com"}. לא עובר דרך שום שרת ביניים.
            </div>
          </div>)}

          {/* ─── STEP 2: UPLOAD ─── */}
          {step === 2 && (<div>
            <h2 style={h2s}>העלו ניוזלטרים לדוגמה</h2>
            <p style={sub}>העלו 3-10 ניוזלטרים קודמים. ה-AI ינתח את סגנון הכתיבה, המבנה והטון.</p>
            <input ref={fileRef} type="file" multiple accept=".txt,.html,.htm,.md,.pdf,.eml" onChange={handleFiles} style={{ display: "none" }} />
            <div onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed rgba(251,191,36,0.25)", borderRadius: 16, padding: 48, textAlign: "center", cursor: "pointer", transition: "all .3s", background: "rgba(251,191,36,0.02)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.5)"; e.currentTarget.style.background = "rgba(251,191,36,0.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; e.currentTarget.style.background = "rgba(251,191,36,0.02)"; }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#fbbf24"; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; }}
              onDrop={(e) => { e.preventDefault(); handleFiles(e); e.currentTarget.style.borderColor = "rgba(251,191,36,0.25)"; }}
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
                  <button onClick={() => setNewsletters((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              ))}
            </div>)}
            {newsletters.length > 0 && newsletters.length < 3 && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.12)", borderRadius: 10, color: "#fbbf24", fontSize: 14 }}>
                ⚠️ העלו לפחות 3 כדי להמשיך ({3 - newsletters.length} חסרים)
              </div>
            )}
          </div>)}

          {/* ─── STEP 3: SOURCES ─── */}
          {step === 3 && (<div>
            <h2 style={h2s}>הגדירו מקורות</h2>
            <p style={sub}>הוסיפו אתרים או חפשו חדשים. לא חובה — בלי מקורות ה-AI ישתמש במקורות מובילים.</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={sourceInput} onChange={(e) => setSourceInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSource()}
                placeholder="הוסיפו URL (למשל techcrunch.com)" style={{ ...inp, direction: "ltr" }}
                onFocus={(e) => e.target.style.borderColor = "rgba(251,191,36,0.4)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
              <button onClick={addSource} style={btnG(true)}>+ הוסף</button>
            </div>
            <div style={{ ...card, marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#fafaf9" }}>🔍 חפשו מקורות באינטרנט</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchSources()}
                  placeholder='"AI news blogs" או "בלוגים ישראליים טכנולוגיה"' style={{ ...inp, fontSize: 14 }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(251,191,36,0.4)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                <button onClick={searchSources} disabled={searching} style={{ ...btnG(true), opacity: searching ? .6 : 1 }}>
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
          </div>)}

          {/* ─── STEP 4: SETTINGS ─── */}
          {step === 4 && (<div>
            <h2 style={h2s}>התאמה אישית</h2>
            <p style={sub}>הגדירו מה הניוזלטר יכסה ואיך ייכתב.</p>
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
          </div>)}

          {/* ─── STEP 5: GENERATE ─── */}
          {step === 5 && (<div>
            <h2 style={h2s}>יצירת הניוזלטר</h2>
            <p style={sub}>הכל מוכן. ה-AI יסרוק חדשות עדכניות ויכתוב טיוטה בסגנון שלכם.</p>
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
              <button onClick={generate}
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
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fbbf24", marginBottom: 8 }}>
                  {genProgress < 20 ? "📡 מכין חומרים..." : genProgress < 60 ? "🔍 סורק חדשות..." : genProgress < 90 ? "✍️ כותב..." : "✨ מלטש..."}
                </div>
                <div style={{ fontSize: 13, color: "#78716c" }}>30-60 שניות</div>
              </div>
            )}

            {error && <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#fca5a5", fontSize: 14 }}>{error}</div>}

            {result && (
              <div style={{ animation: "fadeInUp .6s ease-out" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e" }}>✅ הניוזלטר מוכן!</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={download} style={btnG(true)}>⬇ הורדה</button>
                    <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={btnSec}>{copied ? "✓ הועתק!" : "📋 העתקה"}</button>
                    <button onClick={() => { setResult(""); setGenProgress(0); }} style={btnSec}>🔄 מחדש</button>
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
          </div>)}

          {/* Nav */}
          {step >= 1 && step <= 4 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button onClick={() => setStep((s) => s - 1)} style={btnSec}>{step === 1 ? "→ דף ראשי" : "→ חזרה"}</button>
              <button onClick={() => setStep((s) => s + 1)} disabled={!canNext(step)}
                style={{ background: canNext(step) ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: "12px 32px", color: canNext(step) ? "#0f0f1a" : "#57534e", fontSize: 15, fontWeight: 700, cursor: canNext(step) ? "pointer" : "not-allowed", fontFamily: "'Rubik'", boxShadow: canNext(step) ? "0 4px 16px rgba(251,191,36,0.25)" : "none", transition: "all .3s" }}>
                {step === 4 ? "← ליצירה" : "← המשך"}
              </button>
            </div>
          )}
          {step === 5 && !generating && !result && (
            <div style={{ marginTop: 24 }}><button onClick={() => setStep(4)} style={btnSec}>→ חזרה</button></div>
          )}
        </div>
      </div>
    </div>
  );
}
