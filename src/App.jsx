import { useState, useEffect, useRef } from "react";
import { PROVIDERS, TIMEFRAMES } from "./constants";
import { bg, ctn, btnSec } from "./styles";
import { callLLM, callLLMStreaming, validateKey as apiValidateKey } from "./api";
import { canNext } from "./utils";
import { getUserMessage } from "./errors";
import { isPdf, extractPdfText } from "./pdfUtils";
import { loadSettings, saveSettings, clearSettings } from "./storage";
import Particle from "./components/Particle";
import Landing from "./components/Landing";
import WizardHeader from "./components/WizardHeader";
import WizardNav from "./components/WizardNav";
import ApiKeyStep from "./components/steps/ApiKeyStep";
import UploadStep from "./components/steps/UploadStep";
import SourcesStep from "./components/steps/SourcesStep";
import SettingsStep from "./components/steps/SettingsStep";
import GenerateStep from "./components/steps/GenerateStep";

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
  const [streaming, setStreaming] = useState(false);
  const [linkedinPost, setLinkedinPost] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingLinkedin, setGeneratingLinkedin] = useState(false);
  const abortRef = useRef(null);
  const saveTimerRef = useRef(null);

  // CSS injection
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

  // Load saved settings on mount
  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      if (saved.provider) setProvider(saved.provider);
      if (saved.apiKey) setApiKey(saved.apiKey);
      if (saved.selectedModel) {
        // Validate model belongs to provider
        const p = saved.provider || "anthropic";
        if (PROVIDERS[p]?.models.some((m) => m.id === saved.selectedModel)) {
          setSelectedModel(saved.selectedModel);
        }
      }
      if (saved.sources) setSources(saved.sources);
      if (saved.timeframe) setTimeframe(saved.timeframe);
      if (saved.selectedTopics) setSelectedTopics(saved.selectedTopics);
      if (saved.language) setLanguage(saved.language);
      if (saved.tone) setTone(saved.tone);
    }
  }, []);

  // Provider change reset
  useEffect(() => {
    setSelectedModel(PROVIDERS[provider].models[0].id);
    setKeyValid(null);
    setError("");
  }, [provider]);

  // Debounced save + beforeunload flush
  useEffect(() => {
    const data = { provider, apiKey, selectedModel, sources, timeframe, selectedTopics, language, tone };
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveSettings(data), 500);
    const flush = () => saveSettings(data);
    window.addEventListener("beforeunload", flush);
    return () => {
      clearTimeout(saveTimerRef.current);
      window.removeEventListener("beforeunload", flush);
    };
  }, [provider, apiKey, selectedModel, sources, timeframe, selectedTopics, language, tone]);

  const handleClearSettings = () => {
    clearSettings();
    setProvider("anthropic");
    setApiKey("");
    setSelectedModel("claude-sonnet-4-5-20250929");
    setKeyValid(null);
    setSources([]);
    setTimeframe("1w");
    setSelectedTopics([]);
    setLanguage("he");
    setTone("casual");
    setError("");
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) return;
    setValidating(true); setKeyValid(null); setError("");
    try {
      const res = await apiValidateKey(provider, apiKey);
      setKeyValid(res.valid);
      if (!res.valid) setError(res.error);
    } catch (e) { setKeyValid(false); setError(getUserMessage(e)); }
    setValidating(false);
  };

  const handleApiKeyChange = (val) => {
    setApiKey(val);
    setKeyValid(null);
    setError("");
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target?.files || e.dataTransfer?.files || []);
    if (newsletters.length + files.length > 10) { setError("ניתן להעלות עד 10 ניוזלטרים"); return; }
    setError("");
    for (const f of files) {
      try {
        const txt = isPdf(f) ? await extractPdfText(f) : await f.text();
        if (!txt.trim()) { setError(`הקובץ ${f.name} ריק או מכיל רק תמונות`); continue; }
        setNewsletters((p) => [...p, { name: f.name, content: txt.slice(0, 15000), size: f.size }]);
      } catch {
        setError(`שגיאה בקריאת הקובץ ${f.name}`);
        continue;
      }
    }
    if (e.target?.value) e.target.value = "";
  };

  const addSource = () => { if (!sourceInput.trim()) return; if (!sources.includes(sourceInput.trim())) setSources((p) => [...p, sourceInput.trim()]); setSourceInput(""); };

  const searchSources = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setSearchResults([]);
    try {
      const txt = await callLLM(provider, apiKey, selectedModel, "Return ONLY a JSON array of {name, url} objects. No markdown.", `Find 6-8 RSS feeds or news sources about: ${searchQuery}`, true);
      const clean = txt.replace(/```json|```/g, "").trim();
      try { const r = JSON.parse(clean); setSearchResults(Array.isArray(r) ? r : []); } catch { setSearchResults([]); }
    } catch (e) { setError(getUserMessage(e)); }
    setSearching(false);
  };

  const generate = async () => {
    setGenerating(true); setResult(""); setGenProgress(0); setError(""); setStreaming(true);
    const abortController = new AbortController();
    abortRef.current = abortController;
    const examples = newsletters.map((n, i) => `=== דוגמה ${i + 1}: ${n.name} ===\n${n.content.slice(0, 4000)}`).join("\n\n");
    const tf = TIMEFRAMES.find((t) => t.id === timeframe)?.label || "שבוע";
    const lang = language === "he" ? "עברית" : "אנגלית";
    const tn = tone === "casual" ? "קליל ואישי" : tone === "pro" ? "מקצועי" : "הומוריסטי";
    const sys = `You are an expert AI newsletter ghostwriter. Your #1 job is to perfectly imitate the writing style from the examples provided. You must sound IDENTICAL to the original author.

STYLE CLONING (THIS IS THE MOST IMPORTANT PART):
Before writing, analyze the examples carefully and extract:
1. STRUCTURE: What sections exist? What are their exact names? How many items per section? Copy the section structure exactly.
2. OPENING: How does the author open? Personal anecdote? Provocative statement? Copy the pattern.
3. SENTENCE STYLE: Short or long sentences? Parenthetical asides? Rhetorical questions? Match exactly.
4. TONE MARKERS: Specific phrases the author repeats (e.g. "שורה תחתונה", "ממליץ בחום"). Reuse these exact phrases.
5. HUMOR TYPE: Self-deprecating? Sarcastic? Pop culture references? Match the humor style.
6. FORMATTING: Bold usage, emoji usage, numbered vs bulleted, paragraph length. Copy exactly.
7. LANGUAGE MIX: How much English is mixed in? When? Copy the pattern.
8. READER ADDRESS: How does the author speak to readers? "אתם"? "תשלחו"? Match exactly.
9. SIGN-OFF: How does the newsletter end? Copy the pattern.

Write the newsletter AS IF YOU ARE THE ORIGINAL AUTHOR. Do not add your own style. Do not be more formal or less formal than the examples. Do not add sections that don't exist in the examples. Do not skip sections that do exist.

Additional rules:
- Write in ${lang}
- Tone: Follow the EXACT tone from the examples. The user's general preference is "${tn}", but the examples' actual tone ALWAYS takes priority. If the examples are sarcastic, be sarcastic. If formal, be formal. Clone the tone you see, not the setting.
- Real current news from ${tf}
- Focus: ${selectedTopics.length ? selectedTopics.join(", ") : "all relevant AI topics"}
- Hebrew: natural spoken, not academic (if the examples are in spoken Hebrew)

CRITICAL - SOURCE LINKS:
- Every news item MUST include at least one source link in markdown format: [source name](URL)
- Place the link naturally at the end of each item, e.g. "([מקור](https://...))" or "קראו עוד: [TechCrunch](https://...)"
- For deep-dive sections, include 1-2 links per story
- For short news items, include at least 1 link each
- For tool/product recommendations, link directly to the product page
- Use REAL URLs from your web search results — never make up URLs
- Prefer original sources (company blogs, official announcements) over aggregators`;
    const usr = `HERE ARE THE EXAMPLE NEWSLETTERS — STUDY THEM CAREFULLY AND CLONE THE STYLE EXACTLY:\n\n${examples}\n\nSources to check: ${sources.length ? sources.join("\n") : "Best AI news sources"}\n\nNow write a FULL newsletter for today (${new Date().toLocaleDateString("he-IL")}) covering AI news from the ${tf}.\n\nCRITICAL REMINDERS:\n1. Your output must look like it was written by the SAME PERSON who wrote the examples above. Same section names, same structure, same voice.\n2. Every news item must include at least one real source link in [name](url) format from your web search.\n3. Write ALL sections from opening to closing, exactly matching the example structure.`;
    try {
      setGenProgress(15);
      await callLLMStreaming(provider, apiKey, selectedModel, sys, usr, true, (chunk) => {
        setResult((prev) => prev + chunk);
        setGenProgress((prev) => Math.min(prev + 0.5, 90));
      }, abortController.signal);
      setGenProgress(100);
    } catch (e) {
      if (e.name === "AbortError") { /* cancelled by user */ }
      else setError(getUserMessage(e));
    }
    setStreaming(false);
    setGenerating(false);
    abortRef.current = null;
  };

  const handleCancel = () => {
    if (abortRef.current) abortRef.current.abort();
  };

  const generateLinkedin = async () => {
    setGeneratingLinkedin(true);
    setLinkedinPost("");
    setImagePrompt("");
    const lang = language === "he" ? "Hebrew" : "English";
    const sys = `You are a LinkedIn content strategist. Given a newsletter, identify the single most interesting/engaging idea and write a compelling LinkedIn post about it.

Rules:
- Write the post in ${lang}
- Keep it 150-250 words — punchy, with a hook opening
- Use short paragraphs (1-2 sentences each) for mobile readability
- End with a thought-provoking question or call to action
- No hashtags in the body; add 3-5 relevant hashtags at the end
- Do NOT include links (the user will add their own)

Also generate an image prompt (in English) for an AI image generator that would make a compelling visual for this LinkedIn post. The prompt should describe a clean, professional, visually striking image suitable for LinkedIn.

Return ONLY valid JSON: {"post": "...", "imagePrompt": "..."}`;
    try {
      const raw = await callLLM(provider, apiKey, selectedModel, sys, result, false);
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setLinkedinPost(parsed.post || "");
      setImagePrompt(parsed.imagePrompt || "");
    } catch (e) {
      setError(getUserMessage(e));
    }
    setGeneratingLinkedin(false);
  };

  const download = () => {
    const b = new Blob([result], { type: "text/markdown;charset=utf-8" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = u; a.download = `newsletter-${new Date().toISOString().split("T")[0]}.md`; a.click();
    URL.revokeObjectURL(u);
  };

  const handleStart = (providerId) => { setProvider(providerId); setStep(1); };

  if (step === 0) return <div style={bg}><Landing onStart={handleStart} /></div>;

  return (
    <div style={bg}>
      {[15, 45, 75].map((x, i) => <Particle key={i} x={x} delay={i * 5} size={`${15 + i * 6}px`} />)}
      <div style={ctn}>
        <WizardHeader step={step} setStep={setStep} onClearSettings={handleClearSettings} />
        <div style={{ paddingTop: 48, paddingBottom: 80, animation: "fadeInUp .5s ease-out" }} key={step}>
          {step === 1 && <ApiKeyStep provider={provider} setProvider={setProvider} apiKey={apiKey} setApiKey={handleApiKeyChange} selectedModel={selectedModel} setSelectedModel={setSelectedModel} keyVisible={keyVisible} setKeyVisible={setKeyVisible} keyValid={keyValid} validating={validating} error={error} onValidate={handleValidateKey} />}
          {step === 2 && <UploadStep newsletters={newsletters} error={error} onFiles={handleFiles} onRemove={(i) => setNewsletters((p) => p.filter((_, j) => j !== i))} />}
          {step === 3 && <SourcesStep sources={sources} setSources={setSources} sourceInput={sourceInput} setSourceInput={setSourceInput} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} searching={searching} onSearch={searchSources} onAddSource={addSource} />}
          {step === 4 && <SettingsStep timeframe={timeframe} setTimeframe={setTimeframe} selectedTopics={selectedTopics} setSelectedTopics={setSelectedTopics} language={language} setLanguage={setLanguage} tone={tone} setTone={setTone} />}
          {step === 5 && <GenerateStep provider={provider} selectedModel={selectedModel} newsletters={newsletters} sources={sources} timeframe={timeframe} language={language} tone={tone} generating={generating} genProgress={genProgress} result={result} error={error} copied={copied} streaming={streaming} onGenerate={generate} onDownload={download} onCopy={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} onReset={() => { setResult(""); setGenProgress(0); setLinkedinPost(""); setImagePrompt(""); }}
              linkedinPost={linkedinPost} imagePrompt={imagePrompt} generatingLinkedin={generatingLinkedin} onGenerateLinkedin={generateLinkedin} onCancel={handleCancel} onBack={() => setStep(4)} />}
          {step >= 1 && step <= 4 && <WizardNav step={step} setStep={setStep} keyValid={keyValid} newsletterCount={newsletters.length} />}
        </div>
      </div>
    </div>
  );
}
