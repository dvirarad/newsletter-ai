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
  generatedImage: "",
  generatingImage: false,
  userAdditions: "",
  setUserAdditions: vi.fn(),
  onRewriteLinkedin: vi.fn(),
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

  it("shows image generating spinner", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt text" generatingImage={true} />);
    expect(screen.getByText("יוצר תמונה...")).toBeInTheDocument();
  });

  it("renders generated image", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt text" generatedImage="abc123" />);
    const img = screen.getByAltText("Generated LinkedIn image");
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("data:image/png;base64,abc123");
  });

  it("shows download button when image is generated", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt text" generatedImage="abc123" />);
    expect(screen.getByText("⬇ הורד תמונה")).toBeInTheDocument();
  });

  it("shows image prompt text even when image exists", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="my prompt" generatedImage="abc123" />);
    expect(screen.getByText("my prompt")).toBeInTheDocument();
  });

  it("changes card title when image is generated", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt" generatedImage="abc123" />);
    expect(screen.getByText("🎨 תמונה שנוצרה")).toBeInTheDocument();
  });

  it("shows default card title when no image", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt" />);
    expect(screen.getByText("🎨 פרומפט לתמונה")).toBeInTheDocument();
  });

  it("renders user additions textarea when linkedinPost exists", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt" />);
    expect(screen.getByPlaceholderText("כתבו כאן רעיונות, נקודות, או טקסט שתרצו לשלב בפוסט...")).toBeInTheDocument();
  });

  it("rewrite button is disabled when textarea is empty", () => {
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt" />);
    const btn = screen.getByText("🔄 שכתבו את הפוסט");
    expect(btn).toBeDisabled();
  });

  it("rewrite button calls onRewriteLinkedin when textarea has content", async () => {
    const user = userEvent.setup();
    const onRewriteLinkedin = vi.fn();
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt" userAdditions="my ideas" onRewriteLinkedin={onRewriteLinkedin} />);
    const btn = screen.getByText("🔄 שכתבו את הפוסט");
    expect(btn).not.toBeDisabled();
    await user.click(btn);
    expect(onRewriteLinkedin).toHaveBeenCalled();
  });

  it("calls setUserAdditions on textarea input", async () => {
    const user = userEvent.setup();
    const setUserAdditions = vi.fn();
    render(<GenerateStep {...defaults} result="content" linkedinPost="post" imagePrompt="prompt" setUserAdditions={setUserAdditions} />);
    const textarea = screen.getByPlaceholderText("כתבו כאן רעיונות, נקודות, או טקסט שתרצו לשלב בפוסט...");
    await user.type(textarea, "a");
    expect(setUserAdditions).toHaveBeenCalled();
  });
});
