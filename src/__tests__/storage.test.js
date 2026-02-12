import { describe, it, expect, vi } from "vitest";
import { saveSettings, loadSettings, clearSettings } from "../storage";

describe("storage", () => {
  it("saveSettings stores data as JSON", () => {
    const data = { provider: "anthropic", apiKey: "sk-test" };
    saveSettings(data);
    expect(localStorage.setItem).toHaveBeenCalledWith("newsletter-app-settings", JSON.stringify(data));
  });

  it("loadSettings returns parsed data", () => {
    const data = { provider: "openai", apiKey: "sk-proj-test" };
    localStorage.getItem.mockReturnValueOnce(JSON.stringify(data));
    expect(loadSettings()).toEqual(data);
  });

  it("loadSettings returns null when nothing stored", () => {
    localStorage.getItem.mockReturnValueOnce(null);
    expect(loadSettings()).toBeNull();
  });

  it("loadSettings returns null and clears on corrupted data", () => {
    localStorage.getItem.mockReturnValueOnce("not-json{{{");
    expect(loadSettings()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith("newsletter-app-settings");
  });

  it("loadSettings returns null for non-object JSON", () => {
    localStorage.getItem.mockReturnValueOnce('"string"');
    expect(loadSettings()).toBeNull();
  });

  it("clearSettings removes the key", () => {
    clearSettings();
    expect(localStorage.removeItem).toHaveBeenCalledWith("newsletter-app-settings");
  });
});
