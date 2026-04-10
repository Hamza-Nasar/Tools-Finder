import { NextRequest } from "next/server";
import { handleApiError, ok, parseRequestBody } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";
import { comparisonInsightRequestSchema } from "@/lib/validators/ai";

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
}

export async function POST(request: NextRequest) {
  try {
    if (!AIAssistantService.isEnabled()) {
      throw new AppError(503, "OpenAI is not configured.", "OPENAI_NOT_CONFIGURED");
    }

    const ipAddress = getIpAddress(request);
    const rateLimit = await takeRateLimit(`ai-comparison:${ipAddress}`, {
      limit: 12,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      throw new AppError(429, "Too many comparison requests. Please try again in a minute.", "RATE_LIMITED", {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt
      });
    }

    const payload = await parseRequestBody(request, comparisonInsightRequestSchema);
    const insight = await AIAssistantService.summarizeComparison(payload.toolA, payload.toolB);

    if (!insight) {
      throw new AppError(502, "Unable to generate the AI comparison right now.", "OPENAI_COMPARISON_FAILED");
    }

    return ok(insight, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
