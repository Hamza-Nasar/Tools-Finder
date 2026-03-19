interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

declare global {
  var rateLimitStore: Map<string, number[]> | undefined;
}

const rateLimitStore = global.rateLimitStore ?? new Map<string, number[]>();

export function takeRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;
  const existingEntries = (rateLimitStore.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (existingEntries.length >= options.limit) {
    const resetAt = existingEntries[0] + options.windowMs;

    return {
      allowed: false,
      remaining: 0,
      resetAt
    };
  }

  existingEntries.push(now);
  rateLimitStore.set(key, existingEntries);
  global.rateLimitStore = rateLimitStore;

  return {
    allowed: true,
    remaining: Math.max(options.limit - existingEntries.length, 0),
    resetAt: now + options.windowMs
  };
}
