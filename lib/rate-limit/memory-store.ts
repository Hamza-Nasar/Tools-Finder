import { connectToDatabase } from "@/lib/mongodb";
import { RateLimitWindowModel } from "@/models/RateLimitWindow";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function takeRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  await connectToDatabase();
  const now = Date.now();
  const windowStart = now - (now % options.windowMs);
  const resetAt = windowStart + options.windowMs;
  const expiresAt = new Date(resetAt + Math.max(options.windowMs, 60_000));
  const record = await RateLimitWindowModel.findOneAndUpdate(
    {
      key,
      windowStart
    },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        expiresAt
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).lean<{ count: number } | null>();
  const count = record?.count ?? 0;

  return {
    allowed: count <= options.limit,
    remaining: Math.max(options.limit - count, 0),
    resetAt
  };
}
