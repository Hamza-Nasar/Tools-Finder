import { NextRequest } from "next/server";
import { handleApiError, noContent } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { ToolService } from "@/lib/services/tool-service";

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const ipAddress = getIpAddress(request);
    const rateLimit = takeRateLimit(`tool-view:${ipAddress}:${slug}`, {
      limit: 20,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return noContent();
    }

    await ToolService.recordViewBySlug(slug);

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
