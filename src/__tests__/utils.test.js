import { describe, it, expect } from "vitest";
import { canNext } from "../utils";

describe("canNext", () => {
  it("step 1: returns true when keyValid is true", () => {
    expect(canNext(1, { keyValid: true, newsletterCount: 0 })).toBe(true);
  });

  it("step 1: returns false when keyValid is false", () => {
    expect(canNext(1, { keyValid: false, newsletterCount: 0 })).toBe(false);
  });

  it("step 1: returns false when keyValid is null", () => {
    expect(canNext(1, { keyValid: null, newsletterCount: 0 })).toBe(false);
  });

  it("step 2: returns true when newsletterCount >= 3", () => {
    expect(canNext(2, { keyValid: true, newsletterCount: 3 })).toBe(true);
    expect(canNext(2, { keyValid: true, newsletterCount: 5 })).toBe(true);
  });

  it("step 2: returns false when newsletterCount < 3", () => {
    expect(canNext(2, { keyValid: true, newsletterCount: 2 })).toBe(false);
    expect(canNext(2, { keyValid: true, newsletterCount: 0 })).toBe(false);
  });

  it("step 3: always returns true", () => {
    expect(canNext(3, { keyValid: true, newsletterCount: 0 })).toBe(true);
  });

  it("step 4: always returns true", () => {
    expect(canNext(4, { keyValid: true, newsletterCount: 0 })).toBe(true);
  });
});
