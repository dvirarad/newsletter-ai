const STORAGE_KEY = "newsletter-app-settings";

export function saveSettings(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    return data;
  } catch {
    // Corrupted data — clear and return null
    clearSettings();
    return null;
  }
}

export function clearSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently ignore
  }
}
