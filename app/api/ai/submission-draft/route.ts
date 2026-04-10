import { NextRequest } from "next/server";
import { handleApiError, ok, parseRequestBody } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { CategoryService } from "@/lib/services/category-service";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";
import { submissionDraftRequestSchema } from "@/lib/validators/ai";

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
}

export async function POST(request: NextRequest) {
  try {
    await requireAuthenticatedSession();

    if (!AIAssistantService.isEnabled()) {
      throw new AppError(503, "OpenAI is not configured.", "OPENAI_NOT_CONFIGURED");
    }

    const ipAddress = getIpAddress(request);
    const rateLimit = await takeRateLimit(`ai-submission-draft:${ipAddress}`, {
      limit: 8,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      throw new AppError(429, "Too many AI draft requests. Please try again in a minute.", "RATE_LIMITED", {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt
      });
    }

    const payload = await parseRequestBody(request, submissionDraftRequestSchema);
    const categories = await CategoryService.listPublicCategories();
    const draft = await AIAssistantService.generateSubmissionDraft({
      ...payload,
      categories
    });

    if (!draft) {
      throw new AppError(502, "Unable to generate an AI draft right now.", "OPENAI_DRAFT_FAILED");
    }

    return ok(draft, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
