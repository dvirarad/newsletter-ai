import { ApiError, RateLimitError, AuthError, NetworkError, TimeoutError } from "./errors";

const OPENAI_SEARCH_FALLBACKS = ["gpt-5-nano", "gpt-4o"];

function classifyError(status, message) {
  if (status === 401 || status === 403) throw new AuthError(message);
  if (status === 429) throw new RateLimitError(message);
  throw new ApiError(message, status);
}

export async function fetchWithTimeout(url, options, timeoutMs = 15000) {
  const controller = new AbortController();
  const existing = options.signal;
  if (existing) {
    existing.addEventListener("abort", () => controller.abort(existing.reason));
  }
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (e) {
    if (e.name === "AbortError") {
      if (existing?.aborted) throw e; // user-initiated abort
      throw new TimeoutError();
    }
    throw new NetworkError(e.message);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry(url, options, { maxRetries = 2, timeoutMs = 180000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      if (res.status === 429 && attempt < maxRetries) {
        const wait = Math.min(1000 * 2 ** attempt, 8000);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      return res;
    } catch (e) {
      lastError = e;
      if (e.name === "AbortError" || e.name === "TimeoutError") throw e;
      if (attempt < maxRetries) {
        const wait = Math.min(1000 * 2 ** attempt, 8000);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
    }
  }
  throw lastError;
}

async function openaiSearchRequest(apiKey, model, sys, usr) {
  const body = { model, max_output_tokens: 4000, input: [{ role: "developer", content: sys }, { role: "user", content: usr }], tools: [{ type: "web_search_preview" }] };
  const r = await fetchWithRetry("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Error ${r.status}`); }
  const data = await r.json();
  return (data.output || []).flatMap((o) => (o.content || []).filter((c) => c.type === "output_text").map((c) => c.text)).join("\n\n") || "";
}

export async function callLLM(provider, apiKey, model, sys, usr, search = false) {
  if (provider === "anthropic") {
    const body = { model, max_tokens: 4000, system: sys, messages: [{ role: "user", content: usr }] };
    if (search) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    const r = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey.trim(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify(body),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Error ${r.status}`); }
    const data = await r.json();
    return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n\n");
  } else if (search) {
    const models = [model, ...OPENAI_SEARCH_FALLBACKS.filter((m) => m !== model)];
    let lastErr;
    for (const m of models) {
      try {
        return await openaiSearchRequest(apiKey, m, sys, usr);
      } catch (e) {
        if (e.name === "AuthError" || e.name === "RateLimitError") throw e;
        lastErr = e;
      }
    }
    throw lastErr;
  } else {
    const body = { model, max_completion_tokens: 4000, messages: [{ role: "system", content: sys }, { role: "user", content: usr }] };
    const r = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify(body),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Error ${r.status}`); }
    const data = await r.json();
    return data.choices?.[0]?.message?.content || "";
  }
}

export async function validateKey(provider, apiKey) {
  try {
    if (provider === "anthropic") {
      const r = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey.trim(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5-20250929", max_tokens: 10, messages: [{ role: "user", content: "Say OK" }] }),
      }, 15000);
      if (r.ok || r.status === 429) return { valid: true };
      const d = await r.json().catch(() => ({}));
      return { valid: false, error: d?.error?.message || "מפתח לא תקין" };
    } else {
      const r = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({ model: "gpt-4o", max_completion_tokens: 10, messages: [{ role: "user", content: "Say OK" }] }),
      }, 15000);
      if (r.ok || r.status === 429) return { valid: true };
      const d = await r.json().catch(() => ({}));
      return { valid: false, error: d?.error?.message || "מפתח לא תקין" };
    }
  } catch (e) {
    if (e.name === "TimeoutError") throw e;
    if (e.name === "NetworkError") throw e;
    throw new NetworkError(e.message);
  }
}

export async function callLLMStreaming(provider, apiKey, model, sys, usr, search, onChunk, signal) {
  let lastFlush = 0;
  let buffer = "";

  function flushBuffer() {
    if (buffer) {
      onChunk(buffer);
      buffer = "";
    }
    lastFlush = Date.now();
  }

  function bufferChunk(text) {
    buffer += text;
    if (Date.now() - lastFlush >= 100) {
      flushBuffer();
    }
  }

  if (provider === "anthropic") {
    const body = { model, max_tokens: 4000, system: sys, messages: [{ role: "user", content: usr }], stream: true };
    if (search) body.tools = [{ type: "web_search_20250305", name: "web_search" }];
    const r = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey.trim(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify(body),
      signal,
    }, 180000);
    if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Error ${r.status}`); }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let partial = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      partial += decoder.decode(value, { stream: true });
      const lines = partial.split("\n");
      partial = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        if (json === "[DONE]") continue;
        try {
          const evt = JSON.parse(json);
          if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
            bufferChunk(evt.delta.text);
          }
        } catch { /* skip malformed */ }
      }
    }
    flushBuffer();
  } else if (search) {
    const models = [model, ...OPENAI_SEARCH_FALLBACKS.filter((m) => m !== model)];
    let r;
    let lastErr;
    for (const m of models) {
      try {
        const body = { model: m, max_output_tokens: 4000, input: [{ role: "developer", content: sys }, { role: "user", content: usr }], tools: [{ type: "web_search_preview" }], stream: true };
        r = await fetchWithTimeout("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
          body: JSON.stringify(body),
          signal,
        }, 180000);
        if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Error ${r.status}`); }
        break;
      } catch (e) {
        if (e.name === "AuthError" || e.name === "RateLimitError") throw e;
        lastErr = e;
        r = null;
      }
    }
    if (!r) throw lastErr;

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let partial = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      partial += decoder.decode(value, { stream: true });
      const lines = partial.split("\n");
      partial = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const evt = JSON.parse(json);
          if (evt.type === "response.output_text.delta" && evt.delta) {
            bufferChunk(evt.delta);
          }
        } catch { /* skip malformed */ }
      }
    }
    flushBuffer();
  } else {
    const body = { model, max_completion_tokens: 4000, messages: [{ role: "system", content: sys }, { role: "user", content: usr }], stream: true };
    const r = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify(body),
      signal,
    }, 180000);
    if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Error ${r.status}`); }

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let partial = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      partial += decoder.decode(value, { stream: true });
      const lines = partial.split("\n");
      partial = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") continue;
        try {
          const evt = JSON.parse(json);
          const content = evt.choices?.[0]?.delta?.content;
          if (content) bufferChunk(content);
        } catch { /* skip malformed */ }
      }
    }
    flushBuffer();
  }
}

export async function generateImage(apiKey, prompt) {
  const r = await fetchWithRetry(
    "https://api.openai.com/v1/images/generations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size: "1792x1024", quality: "auto", output_format: "png" }),
    },
    { maxRetries: 1, timeoutMs: 120000 },
  );
  if (!r.ok) { const d = await r.json().catch(() => ({})); classifyError(r.status, d?.error?.message || `Image generation error ${r.status}`); }
  const data = await r.json();
  return data?.data?.[0]?.b64_json || "";
}
