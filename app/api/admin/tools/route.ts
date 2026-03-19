import { NextRequest } from "next/server";
import { handleApiError, paginated, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { ToolService } from "@/lib/services/tool-service";
import { toolListQuerySchema } from "@/lib/validators/tool";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const query = parseSearchParams(request.nextUrl.searchParams, toolListQuerySchema);
    const result = await ToolService.listTools({
      q: query.q,
      category: query.category,
      tags:
        query.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) ??
        (query.tag ? [query.tag] : undefined),
      pricing: query.pricing,
      sort: query.sort,
      featured: query.featured,
      recent: query.recent,
      status: query.status,
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      includeNonApproved: true
    });

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}
