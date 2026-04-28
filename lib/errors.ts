export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = "APP_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function collectErrorStrings(error: unknown): string[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const candidate = error as {
    name?: unknown;
    message?: unknown;
    code?: unknown;
    cause?: unknown;
    reason?: unknown;
  };

  const values = [candidate.name, candidate.message, candidate.code];

  if (candidate.cause && typeof candidate.cause === "object") {
    const cause = candidate.cause as { name?: unknown; message?: unknown; code?: unknown };
    values.push(cause.name, cause.message, cause.code);
  }

  if (candidate.reason && typeof candidate.reason === "object") {
    const reason = candidate.reason as { type?: unknown };
    values.push(reason.type);
  }

  return values.filter((value): value is string => typeof value === "string");
}

export function isDatabaseUnavailableError(error: unknown) {
  if (isAppError(error)) {
    return false;
  }

  const haystack = collectErrorStrings(error).join(" ");

  return [
    "MongooseServerSelectionError",
    "MongoNetworkError",
    "ECONNREFUSED",
    "ENOTFOUND",
    "connection timed out",
    "buffering timed out",
    "before initial connection is complete",
    "MONGODB_URI is not configured"
  ].some((token) => haystack.includes(token));
}

export function isMissingTextIndexError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    codeName?: unknown;
    message?: unknown;
  };

  const haystack = [
    ...collectErrorStrings(error),
    typeof candidate.codeName === "string" ? candidate.codeName : "",
    typeof candidate.message === "string" ? candidate.message : ""
  ].join(" ");

  return candidate.code === 27 || haystack.includes("IndexNotFound") || haystack.includes("text index required for $text query");
}

export function isLikelyRuntimeCallError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { message?: unknown; cause?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message : "";
  const causeMessage =
    candidate.cause && typeof candidate.cause === "object" && "message" in candidate.cause
      ? String((candidate.cause as { message?: unknown }).message ?? "")
      : "";
  const haystack = `${message} ${causeMessage}`;

  return haystack.includes("Cannot read properties of undefined (reading 'call')");
}
