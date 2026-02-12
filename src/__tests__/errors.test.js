import { describe, it, expect } from "vitest";
import { ApiError, RateLimitError, AuthError, NetworkError, TimeoutError, getUserMessage } from "../errors";

describe("Error classes", () => {
  it("ApiError has name and status", () => {
    const err = new ApiError("test", 500);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(500);
    expect(err.message).toBe("test");
  });

  it("RateLimitError is an ApiError with status 429", () => {
    const err = new RateLimitError();
    expect(err.name).toBe("RateLimitError");
    expect(err.status).toBe(429);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("AuthError is an ApiError with status 401", () => {
    const err = new AuthError();
    expect(err.name).toBe("AuthError");
    expect(err.status).toBe(401);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("NetworkError has correct name", () => {
    const err = new NetworkError("offline");
    expect(err.name).toBe("NetworkError");
    expect(err.message).toBe("offline");
  });

  it("TimeoutError has correct name", () => {
    const err = new TimeoutError();
    expect(err.name).toBe("TimeoutError");
  });
});

describe("getUserMessage", () => {
  it("returns Hebrew message for AuthError", () => {
    const msg = getUserMessage(new AuthError());
    expect(msg).toContain("אימות");
  });

  it("returns Hebrew message for RateLimitError", () => {
    const msg = getUserMessage(new RateLimitError());
    expect(msg).toContain("מגבלת");
  });

  it("returns Hebrew message for TimeoutError", () => {
    const msg = getUserMessage(new TimeoutError());
    expect(msg).toContain("זמן");
  });

  it("returns Hebrew message for NetworkError", () => {
    const msg = getUserMessage(new NetworkError());
    expect(msg).toContain("רשת");
  });

  it("returns status for ApiError", () => {
    const msg = getUserMessage(new ApiError("bad", 500));
    expect(msg).toContain("500");
  });

  it("returns generic message for unknown errors", () => {
    const msg = getUserMessage(new Error("something"));
    expect(msg).toContain("something");
  });
});
