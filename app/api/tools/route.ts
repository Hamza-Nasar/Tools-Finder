import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { created, handleApiError, paginated, parseRequestBody, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { ToolService } from "@/lib/services/tool-service";
import { UserService } from "@/lib/services/user-service";
import { createToolSchema, toolListQuerySchema } from "@/lib/validators/tool";

export async function GET(request: NextRequest) {
  try {
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
      limit: query.limit ?? 12
    });

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const user = await UserService.syncSessionUser(session);
    const payload = await parseRequestBody(request, createToolSchema);
    const tool = await ToolService.createTool({
      slug: payload.slug,
      name: payload.name,
      tagline: payload.tagline,
      website: payload.website,
      affiliateUrl: payload.affiliateUrl ?? null,
      description: payload.description,
      categorySlug: payload.categorySlug,
      tags: payload.tags,
      pricing: payload.pricing,
      logo: payload.logo ?? null,
      screenshots: payload.screenshots,
      featured: payload.featured,
      trendingScore: payload.trendingScore,
      rating: payload.rating,
      reviewCount: payload.reviewCount,
      status: payload.status,
      createdBy: user.id
    });

    revalidateTag("tools");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/tools");
    revalidatePath(`/tools/${tool.slug}`);
    revalidatePath(`/categories/${tool.categorySlug}`);
    revalidatePath("/admin/tools");

    return created(tool);
  } catch (error) {
    return handleApiError(error);
  }
}
