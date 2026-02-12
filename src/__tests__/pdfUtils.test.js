import { describe, it, expect, vi } from "vitest";

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn(),
}));

vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({ default: "mock-worker-url" }));

import { isPdf, extractPdfText } from "../pdfUtils";
import { getDocument } from "pdfjs-dist";

describe("isPdf", () => {
  it("detects PDF by MIME type", () => {
    expect(isPdf({ type: "application/pdf", name: "file.txt" })).toBe(true);
  });

  it("detects PDF by .pdf extension", () => {
    expect(isPdf({ type: "", name: "newsletter.pdf" })).toBe(true);
  });

  it("detects PDF by .PDF extension (case-insensitive)", () => {
    expect(isPdf({ type: "", name: "DOC.PDF" })).toBe(true);
  });

  it("returns false for non-PDF files", () => {
    expect(isPdf({ type: "text/plain", name: "file.txt" })).toBe(false);
  });
});

describe("extractPdfText", () => {
  it("extracts text from all pages", async () => {
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [{ str: "Hello" }, { str: " world" }],
      }),
    };
    getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: vi.fn().mockResolvedValue(mockPage),
      }),
    });

    const file = { arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) };
    const text = await extractPdfText(file);
    expect(text).toBe("Hello  world\n\nHello  world");
    expect(getDocument).toHaveBeenCalledWith({ data: expect.any(ArrayBuffer) });
  });

  it("returns empty string for PDF with no text", async () => {
    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({ items: [] }),
    };
    getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue(mockPage),
      }),
    });

    const file = { arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)) };
    const text = await extractPdfText(file);
    expect(text).toBe("");
  });
});
