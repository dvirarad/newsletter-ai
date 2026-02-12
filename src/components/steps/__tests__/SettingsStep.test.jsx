import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsStep from "../SettingsStep";

const defaults = {
  timeframe: "1w",
  setTimeframe: vi.fn(),
  selectedTopics: [],
  setSelectedTopics: vi.fn(),
  language: "he",
  setLanguage: vi.fn(),
  tone: "casual",
  setTone: vi.fn(),
};

describe("SettingsStep", () => {
  it("renders all timeframe options", () => {
    render(<SettingsStep {...defaults} />);
    expect(screen.getByText("24 שעות אחרונות")).toBeInTheDocument();
    expect(screen.getByText("3 ימים אחרונים")).toBeInTheDocument();
    expect(screen.getByText("שבוע אחרון")).toBeInTheDocument();
    expect(screen.getByText("שבועיים")).toBeInTheDocument();
  });

  it("calls setTimeframe when clicking a timeframe", async () => {
    const user = userEvent.setup();
    const setTimeframe = vi.fn();
    render(<SettingsStep {...defaults} setTimeframe={setTimeframe} />);
    await user.click(screen.getByText("24 שעות אחרונות"));
    expect(setTimeframe).toHaveBeenCalledWith("1d");
  });

  it("renders topic buttons", () => {
    render(<SettingsStep {...defaults} />);
    expect(screen.getByText("מודלים חדשים (LLMs)")).toBeInTheDocument();
    expect(screen.getByText("AI בישראל")).toBeInTheDocument();
  });

  it("calls setSelectedTopics when toggling a topic", async () => {
    const user = userEvent.setup();
    const setSelectedTopics = vi.fn();
    render(<SettingsStep {...defaults} setSelectedTopics={setSelectedTopics} />);
    await user.click(screen.getByText("רובוטיקה"));
    expect(setSelectedTopics).toHaveBeenCalled();
  });

  it("renders language buttons", () => {
    render(<SettingsStep {...defaults} />);
    expect(screen.getByText("עברית")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("calls setLanguage when clicking English", async () => {
    const user = userEvent.setup();
    const setLanguage = vi.fn();
    render(<SettingsStep {...defaults} setLanguage={setLanguage} />);
    await user.click(screen.getByText("English"));
    expect(setLanguage).toHaveBeenCalledWith("en");
  });

  it("renders tone buttons", () => {
    render(<SettingsStep {...defaults} />);
    expect(screen.getByText("קליל")).toBeInTheDocument();
    expect(screen.getByText("מקצועי")).toBeInTheDocument();
    expect(screen.getByText("הומוריסטי")).toBeInTheDocument();
  });

  it("calls setTone when clicking a tone", async () => {
    const user = userEvent.setup();
    const setTone = vi.fn();
    render(<SettingsStep {...defaults} setTone={setTone} />);
    await user.click(screen.getByText("מקצועי"));
    expect(setTone).toHaveBeenCalledWith("pro");
  });
});
