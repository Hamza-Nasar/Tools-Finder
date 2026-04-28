import { NextRequest } from "next/server";
import { handleApiError, ok, parseSearchParams } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { RecommendationService } from "@/lib/services/recommendation-service";
import { toolRecommendationQuerySchema } from "@/lib/validators/tool";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const rateLimit = await takeRateLimit(`tool-recommendations:${ipAddress}`, {
      limit: 20,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      throw new AppError(429, "Rate limit exceeded.", "RATE_LIMITED", {
        resetAt: rateLimit.resetAt
      });
    }

    const query = parseSearchParams(request.nextUrl.searchParams, toolRecommendationQuerySchema);
    const recommendations = await RecommendationService.recommendTools(query.q, query.limit);

    return ok(recommendations, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
