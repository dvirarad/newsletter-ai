import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerateStep from "../GenerateStep";

const defaults = {
  provider: "anthropic",
  selectedModel: "claude-sonnet-4-5-20250929",
  newsletters: [{ name: "a" }, { name: "b" }, { name: "c" }],
  sources: ["techcrunch.com"],
  timeframe: "1w",
  language: "he",
  tone: "casual",
  generating: false,
  genProgress: 0,
  result: "",
  error: "",
  copied: false,
  streaming: false,
  onGenerate: vi.fn(),
  onDownload: vi.fn(),
  onCopy: vi.fn(),
  onReset: vi.fn(),
  onCancel: vi.fn(),
  onBack: vi.fn(),
};

describe("GenerateStep", () => {
  it("renders the summary grid", () => {
    render(<GenerateStep {...defaults} />);
    expect(screen.getByText("3 ניוזלטרים")).toBeInTheDocument();
    expect(screen.getByText("1 מקורות")).toBeInTheDocument();
    expect(screen.getByText("שבוע אחרון")).toBeInTheDocument();
  });

  it("shows generate button when not generating and no result", () => {
    render(<GenerateStep {...defaults} />);
    expect(screen.getByText("🚀 צרו את הניוזלטר שלי")).toBeInTheDocument();
  });

  it("calls onGenerate when clicking generate", async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<GenerateStep {...defaults} onGenerate={onGenerate} />);
    await user.click(screen.getByText("🚀 צרו את הניוזלטר שלי"));
    expect(onGenerate).toHaveBeenCalled();
  });

  it("shows progress bar when generating", () => {
    render(<GenerateStep {...defaults} generating={true} genProgress={50} />);
    expect(screen.getByText("🔍 סורק חדשות...")).toBeInTheDocument();
  });

  it("shows cancel button when generating", () => {
    render(<GenerateStep {...defaults} generating={true} genProgress={10} />);
    expect(screen.getByText("ביטול")).toBeInTheDocument();
  });

  it("renders result with action buttons", () => {
    render(<GenerateStep {...defaults} result="Newsletter content here" />);
    expect(screen.getByText("✅ הניוזלטר מוכן!")).toBeInTheDocument();
    expect(screen.getByText("⬇ הורדה")).toBeInTheDocument();
    expect(screen.getByText("📋 העתקה")).toBeInTheDocument();
    expect(screen.getByText("🔄 מחדש")).toBeInTheDocument();
  });

  it("shows error when present", () => {
    render(<GenerateStep {...defaults} error="שגיאה" />);
    expect(screen.getByText("שגיאה")).toBeInTheDocument();
  });

  it("shows back button when not generating and no result", () => {
    render(<GenerateStep {...defaults} />);
    expect(screen.getByText("→ חזרה")).toBeInTheDocument();
  });
});
