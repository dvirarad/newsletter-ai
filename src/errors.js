export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class RateLimitError extends ApiError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

export class AuthError extends ApiError {
  constructor(message = "Authentication failed") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network error") {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export function getUserMessage(error) {
  if (error.name === "AuthError") return "שגיאת אימות: המפתח לא תקין או שפג תוקפו.";
  if (error.name === "RateLimitError") return "חריגה ממגבלת הבקשות. נסו שוב בעוד מספר שניות.";
  if (error.name === "TimeoutError") return "הבקשה ארכה יותר מדי זמן. נסו שוב.";
  if (error.name === "NetworkError") return "שגיאת רשת. בדקו את החיבור לאינטרנט.";
  if (error.name === "ApiError") return `שגיאת API (${error.status}): ${error.message}`;
  if (error.name === "AbortError") return "הבקשה בוטלה.";
  return "שגיאה לא צפויה: " + error.message;
}
