import { NextRequest } from "next/server";
import { handleApiError, noContent } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { getOptionalSession } from "@/lib/server-guards";
import { ToolAnalyticsService } from "@/lib/services/tool-analytics-service";
import { UserActivityService } from "@/lib/services/user-activity-service";
import { UserService } from "@/lib/services/user-service";

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

    const [viewRecord, session] = await Promise.all([ToolAnalyticsService.recordToolView(slug), getOptionalSession()]);

    if (session?.user) {
      const user = await UserService.syncSessionUser(session);
      await UserActivityService.recordToolViewed(user.id, viewRecord.id);
    }

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
