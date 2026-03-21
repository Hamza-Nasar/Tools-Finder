import { z } from "zod";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { ToolAnalyticsService } from "@/lib/services/tool-analytics-service";

const compareClickSchema = z.object({
  sourceSlug: z.string().trim().min(1),
  targetSlug: z.string().trim().min(1).optional()
});

function getIpAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, compareClickSchema);
    const rateLimit = takeRateLimit(`compare-click:${getIpAddress(request)}:${payload.sourceSlug}:${payload.targetSlug ?? ""}`, {
      limit: 40,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return created({ tracked: false, limited: true });
    }

    const tracked = await ToolAnalyticsService.recordComparisonClick([
      payload.sourceSlug,
      payload.targetSlug ?? ""
    ]);

    return created({ tracked: true, count: tracked.length });
  } catch (error) {
    return handleApiError(error);
  }
}
