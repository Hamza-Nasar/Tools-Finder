import { NextRequest } from "next/server";
import { handleApiError, ok, parseSearchParams } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { hasPlanFeature, normalizeUserPlan } from "@/lib/plans";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { getOptionalSession } from "@/lib/server-guards";
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
    const requestedLimit = Math.max(1, Math.min(query.limit, 10));
    const session = await getOptionalSession();
    const userPlan = normalizeUserPlan(session?.user?.plan);
    const canUseAdvancedDepth = hasPlanFeature(userPlan, "advanced_compare");

    if (requestedLimit > 4 && !canUseAdvancedDepth) {
      throw new AppError(
        403,
        "Advanced recommendation depth requires Pro or Vendor plan.",
        "PLAN_UPGRADE_REQUIRED",
        { requiredFeature: "advanced_compare" }
      );
    }

    const effectiveLimit = canUseAdvancedDepth ? requestedLimit : Math.min(requestedLimit, 4);
    const recommendations = await RecommendationService.recommendTools(query.q, effectiveLimit);

    return ok(recommendations, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt),
        "X-Plan": userPlan
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
