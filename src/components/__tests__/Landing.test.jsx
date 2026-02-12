import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Landing from "../Landing";

describe("Landing", () => {
  it("renders the main heading", () => {
    render(<Landing onStart={() => {}} />);
    expect(screen.getByText(/הניוזלטר שלך/)).toBeInTheDocument();
  });

  it("renders provider buttons", () => {
    render(<Landing onStart={() => {}} />);
    expect(screen.getByText("Claude (Anthropic)")).toBeInTheDocument();
    expect(screen.getByText("GPT (OpenAI)")).toBeInTheDocument();
  });

  it("calls onStart with provider id when clicking a provider", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<Landing onStart={onStart} />);
    await user.click(screen.getByText("Claude (Anthropic)"));
    expect(onStart).toHaveBeenCalledWith("anthropic");
  });

  it("calls onStart with openai when clicking GPT", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<Landing onStart={onStart} />);
    await user.click(screen.getByText("GPT (OpenAI)"));
    expect(onStart).toHaveBeenCalledWith("openai");
  });

  it("renders the how-it-works section", () => {
    render(<Landing onStart={() => {}} />);
    expect(screen.getByText("איך זה עובד?")).toBeInTheDocument();
  });
});
