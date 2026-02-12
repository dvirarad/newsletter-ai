import { describe, it, expect, vi, beforeEach } from "vitest";
import { callLLM, validateKey } from "../api";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("callLLM", () => {
  it("sends correct headers for anthropic", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ type: "text", text: "hello" }] }),
    }));
    const result = await callLLM("anthropic", "sk-ant-test", "claude-sonnet-4-5-20250929", "sys", "usr");
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(opts.headers["x-api-key"]).toBe("sk-ant-test");
    expect(opts.headers["anthropic-version"]).toBe("2023-06-01");
    expect(result).toBe("hello");
  });

  it("sends correct headers for openai", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: "world" } }] }),
    }));
    const result = await callLLM("openai", "sk-proj-test", "gpt-4o", "sys", "usr");
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(opts.headers.Authorization).toBe("Bearer sk-proj-test");
    const body = JSON.parse(opts.body);
    expect(body.max_completion_tokens).toBe(4000);
    expect(body.max_tokens).toBeUndefined();
    expect(result).toBe("world");
  });

  it("throws AuthError on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: "invalid key" } }),
    }));
    await expect(callLLM("anthropic", "bad", "model", "sys", "usr")).rejects.toThrow("invalid key");
  });

  it("includes web_search tool when search=true for anthropic", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ type: "text", text: "ok" }] }),
    }));
    await callLLM("anthropic", "key", "model", "sys", "usr", true);
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.tools).toEqual([{ type: "web_search_20250305", name: "web_search" }]);
  });

  it("uses Responses API for openai when search=true", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        output: [{ content: [{ type: "output_text", text: "search result" }] }],
      }),
    }));
    const result = await callLLM("openai", "sk-proj-test", "gpt-5.2", "sys", "usr", true);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(opts.body);
    expect(body.tools).toEqual([{ type: "web_search_preview" }]);
    expect(body.input).toEqual([{ role: "developer", content: "sys" }, { role: "user", content: "usr" }]);
    expect(body.max_output_tokens).toBe(4000);
    expect(body.messages).toBeUndefined();
    expect(body.max_completion_tokens).toBeUndefined();
    expect(result).toBe("search result");
  });

  it("uses Chat Completions for openai when search=false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: "no search" } }] }),
    }));
    const result = await callLLM("openai", "sk-proj-test", "gpt-4o", "sys", "usr", false);
    const [url] = fetch.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
    expect(result).toBe("no search");
  });
});

describe("validateKey", () => {
  it("returns valid:true on 200 for anthropic", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const res = await validateKey("anthropic", "sk-ant-test");
    expect(res.valid).toBe(true);
  });

  it("returns valid:true on 429 (rate limited but key is valid)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    const res = await validateKey("anthropic", "sk-ant-test");
    expect(res.valid).toBe(true);
  });

  it("returns valid:false with error on 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 401,
      json: () => Promise.resolve({ error: { message: "bad key" } }),
    }));
    const res = await validateKey("anthropic", "bad-key");
    expect(res.valid).toBe(false);
    expect(res.error).toBe("bad key");
  });

  it("returns valid:true on 200 for openai", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    const res = await validateKey("openai", "sk-proj-test");
    expect(res.valid).toBe(true);
  });
});
