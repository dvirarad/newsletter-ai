import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UploadStep from "../UploadStep";

describe("UploadStep", () => {
  it("renders the upload zone", () => {
    render(<UploadStep newsletters={[]} error="" onFiles={() => {}} onRemove={() => {}} />);
    expect(screen.getByText("גררו קבצים לכאן או לחצו")).toBeInTheDocument();
  });

  it("shows file count when files exist", () => {
    const newsletters = [
      { name: "test1.txt", content: "c1", size: 1024 },
      { name: "test2.txt", content: "c2", size: 2048 },
    ];
    render(<UploadStep newsletters={newsletters} error="" onFiles={() => {}} onRemove={() => {}} />);
    expect(screen.getByText("2/10 קבצים")).toBeInTheDocument();
    expect(screen.getByText("test1.txt")).toBeInTheDocument();
    expect(screen.getByText("test2.txt")).toBeInTheDocument();
  });

  it("shows warning when less than 3 files", () => {
    const newsletters = [
      { name: "test1.txt", content: "c1", size: 1024 },
    ];
    render(<UploadStep newsletters={newsletters} error="" onFiles={() => {}} onRemove={() => {}} />);
    expect(screen.getByText(/העלו לפחות 3/)).toBeInTheDocument();
    expect(screen.getByText(/2 חסרים/)).toBeInTheDocument();
  });

  it("does not show warning when 3+ files", () => {
    const newsletters = [
      { name: "a.txt", content: "c", size: 100 },
      { name: "b.txt", content: "c", size: 100 },
      { name: "c.txt", content: "c", size: 100 },
    ];
    render(<UploadStep newsletters={newsletters} error="" onFiles={() => {}} onRemove={() => {}} />);
    expect(screen.queryByText(/העלו לפחות 3/)).not.toBeInTheDocument();
  });

  it("shows error when provided", () => {
    render(<UploadStep newsletters={[]} error="ניתן להעלות עד 10 ניוזלטרים" onFiles={() => {}} onRemove={() => {}} />);
    expect(screen.getByText("ניתן להעלות עד 10 ניוזלטרים")).toBeInTheDocument();
  });
});
