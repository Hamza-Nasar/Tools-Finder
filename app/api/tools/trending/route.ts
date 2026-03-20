import { z } from "zod";
import { handleApiError, ok, parseSearchParams } from "@/lib/api";
import { ToolService } from "@/lib/services/tool-service";

const trendingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).default(6)
});

export async function GET(request: Request) {
  try {
    const query = parseSearchParams(new URL(request.url).searchParams, trendingQuerySchema);
    const tools = await ToolService.listTrendingTools(query.limit);

    return ok(tools);
  } catch (error) {
    return handleApiError(error);
  }
}
