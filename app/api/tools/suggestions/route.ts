import { NextRequest } from "next/server";
import { handleApiError, ok, parseSearchParams } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { ToolService } from "@/lib/services/tool-service";
import { toolSuggestionQuerySchema } from "@/lib/validators/tool";

export async function GET(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const rateLimit = takeRateLimit(`tool-suggestions:${ipAddress}`, {
      limit: 40,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return ok({ suggestions: [] });
    }

    const query = parseSearchParams(request.nextUrl.searchParams, toolSuggestionQuerySchema);
    const suggestions = await ToolService.listSearchSuggestions(query.q, query.limit);

    return ok({ suggestions });
  } catch (error) {
    return handleApiError(error);
  }
}
