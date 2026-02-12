import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourcesStep from "../SourcesStep";

const defaults = {
  sources: [],
  setSources: vi.fn(),
  sourceInput: "",
  setSourceInput: vi.fn(),
  searchQuery: "",
  setSearchQuery: vi.fn(),
  searchResults: [],
  searching: false,
  onSearch: vi.fn(),
  onAddSource: vi.fn(),
};

describe("SourcesStep", () => {
  it("renders the add source input", () => {
    render(<SourcesStep {...defaults} />);
    expect(screen.getByPlaceholderText(/הוסיפו URL/)).toBeInTheDocument();
  });

  it("calls onAddSource when clicking add button", async () => {
    const user = userEvent.setup();
    const onAddSource = vi.fn();
    render(<SourcesStep {...defaults} sourceInput="example.com" onAddSource={onAddSource} />);
    await user.click(screen.getByText("+ הוסף"));
    expect(onAddSource).toHaveBeenCalled();
  });

  it("displays sources list", () => {
    render(<SourcesStep {...defaults} sources={["techcrunch.com", "theverge.com"]} />);
    expect(screen.getByText("techcrunch.com")).toBeInTheDocument();
    expect(screen.getByText("theverge.com")).toBeInTheDocument();
    expect(screen.getByText("מקורות (2)")).toBeInTheDocument();
  });

  it("renders search results", () => {
    const searchResults = [{ name: "TechCrunch", url: "https://techcrunch.com" }];
    render(<SourcesStep {...defaults} searchResults={searchResults} />);
    expect(screen.getByText("TechCrunch")).toBeInTheDocument();
  });
});
