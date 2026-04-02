import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { requireAdminSession } from "@/lib/server-guards";
import { ToolDiscoveryService } from "@/lib/services/tool-discovery-service";
import { discoveredToolImportSchema } from "@/lib/validators/tool";

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const ipAddress = getIpAddress(request);
    const rateLimit = await takeRateLimit(`tool-search-import:${ipAddress}`, {
      limit: 12,
      windowMs: 10 * 60_000
    });

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: "Rate limit exceeded.",
          code: "RATE_LIMITED"
        },
        { status: 429 }
      );
    }

    const payload = await parseRequestBody(request, discoveredToolImportSchema);
    const tool = await ToolDiscoveryService.importDiscoveredTool({
      provider: payload.provider,
      name: payload.name,
      tagline: payload.tagline,
      description: payload.description,
      website: payload.website,
      categorySlug: payload.categorySlug,
      tags: payload.tags,
      pricing: payload.pricing,
      logo: payload.logo ?? null,
      directoryUrl: payload.directoryUrl ?? null
    });

    revalidateTag("tools");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/tools");
    revalidatePath(`/tools/${tool.slug}`);
    revalidatePath(`/categories/${tool.categorySlug}`);

    return created({
      tool
    });
  } catch (error) {
    return handleApiError(error);
  }
}
