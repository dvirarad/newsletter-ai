import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock the api module to avoid real fetch calls
vi.mock("../api", () => ({
  callLLM: vi.fn(),
  callLLMStreaming: vi.fn(),
  validateKey: vi.fn(),
}));

// Mock pdfUtils to avoid loading real pdfjs-dist in App tests
vi.mock("../pdfUtils", () => ({
  isPdf: vi.fn(() => false),
  extractPdfText: vi.fn(() => Promise.resolve("")),
}));

describe("App", () => {
  it("renders the landing page initially", () => {
    render(<App />);
    expect(screen.getByText(/הניוזלטר שלך/)).toBeInTheDocument();
    expect(screen.getByText("Claude (Anthropic)")).toBeInTheDocument();
    expect(screen.getByText("GPT (OpenAI)")).toBeInTheDocument();
  });

  it("navigates to step 1 when clicking a provider on landing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Claude (Anthropic)"));
    expect(screen.getByText("חברו את ה-AI שלכם")).toBeInTheDocument();
  });

  it("navigates to step 1 with openai when clicking GPT", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("GPT (OpenAI)"));
    expect(screen.getByText("חברו את ה-AI שלכם")).toBeInTheDocument();
  });

  it("shows back button on step 1 that goes to landing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Claude (Anthropic)"));
    expect(screen.getByText("→ דף ראשי")).toBeInTheDocument();
    await user.click(screen.getByText("→ דף ראשי"));
    expect(screen.getByText(/הניוזלטר שלך/)).toBeInTheDocument();
  });

  it("shows the wizard header with step indicators on step 1", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Claude (Anthropic)"));
    expect(screen.getByText("Newsletter AI")).toBeInTheDocument();
    expect(screen.getByText("חיבור")).toBeInTheDocument();
    expect(screen.getByText("סגנון")).toBeInTheDocument();
  });

  it("next button is disabled on step 1 without valid key", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByText("Claude (Anthropic)"));
    const nextBtn = screen.getByText("← המשך");
    expect(nextBtn).toBeDisabled();
  });
});
