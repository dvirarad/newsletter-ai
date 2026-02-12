export const STEPS = [
  { id: 1, label: "חיבור", icon: "🔑" },
  { id: 2, label: "סגנון", icon: "✍️" },
  { id: 3, label: "מקורות", icon: "🔗" },
  { id: 4, label: "הגדרות", icon: "⚙️" },
  { id: 5, label: "יצירה", icon: "🚀" },
];

export const TIMEFRAMES = [
  { id: "1d", label: "24 שעות אחרונות", icon: "⚡" },
  { id: "3d", label: "3 ימים אחרונים", icon: "📅" },
  { id: "1w", label: "שבוע אחרון", icon: "📰" },
  { id: "2w", label: "שבועיים", icon: "📚" },
];

export const TOPICS = [
  "מודלים חדשים (LLMs)", "AI וביטחון סייבר", "רגולציה ומשפט", "AI בבריאות",
  "סטארטאפים וגיוסים", "כלים ומוצרים חדשים", "AI ותעסוקה", "רובוטיקה", "AI בישראל", "אתיקה ובטיחות",
];

export const PROVIDERS = {
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
      { id: "gpt-4o", label: "GPT-4o", desc: "מהיר וחסכוני", badge: null },
      { id: "gpt-5.2", label: "GPT-5.2", desc: "חכם ומדויק", badge: "מומלץ" },
      { id: "gpt-5.3", label: "GPT-5.3", desc: "החזק ביותר", badge: "חדש" },
    ],
  },
};
