import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApiKeyStep from "../ApiKeyStep";

const defaults = {
  provider: "anthropic",
  setProvider: vi.fn(),
  apiKey: "",
  setApiKey: vi.fn(),
  selectedModel: "claude-sonnet-4-5-20250929",
  setSelectedModel: vi.fn(),
  keyVisible: false,
  setKeyVisible: vi.fn(),
  keyValid: null,
  validating: false,
  error: "",
  onValidate: vi.fn(),
};

describe("ApiKeyStep", () => {
  it("renders provider toggle buttons", () => {
    render(<ApiKeyStep {...defaults} />);
    expect(screen.getByText("Claude (Anthropic)")).toBeInTheDocument();
    expect(screen.getByText("GPT (OpenAI)")).toBeInTheDocument();
  });

  it("calls setProvider when switching provider", async () => {
    const user = userEvent.setup();
    const setProvider = vi.fn();
    render(<ApiKeyStep {...defaults} setProvider={setProvider} />);
    await user.click(screen.getByText("GPT (OpenAI)"));
    expect(setProvider).toHaveBeenCalledWith("openai");
  });

  it("shows validation success state", () => {
    render(<ApiKeyStep {...defaults} keyValid={true} />);
    expect(screen.getByText("מפתח תקין! מוכנים להמשיך.")).toBeInTheDocument();
  });

  it("shows validation error state", () => {
    render(<ApiKeyStep {...defaults} keyValid={false} error="bad key" />);
    expect(screen.getByText(/bad key/)).toBeInTheDocument();
  });

  it("shows model selector when key is valid", () => {
    render(<ApiKeyStep {...defaults} keyValid={true} />);
    expect(screen.getByText("בחרו מודל")).toBeInTheDocument();
    // Model names appear both as badges in provider toggle and in model selector
    expect(screen.getAllByText("Sonnet 4.5").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Opus 4.6").length).toBeGreaterThanOrEqual(2);
  });

  it("hides model selector when key is not validated", () => {
    render(<ApiKeyStep {...defaults} keyValid={null} />);
    expect(screen.queryByText("בחרו מודל")).not.toBeInTheDocument();
  });

  it("shows security banner with local storage mention", () => {
    render(<ApiKeyStep {...defaults} />);
    expect(screen.getByText(/local storage/)).toBeInTheDocument();
  });
});
