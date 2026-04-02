import { NextRequest, NextResponse } from "next/server";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { ToolService } from "@/lib/services/tool-service";
import { ToolAnalyticsService } from "@/lib/services/tool-analytics-service";

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await ToolService.getToolBySlug(slug);
  const rateLimit = await takeRateLimit(`tool-click:${getIpAddress(request)}:${slug}`, {
    limit: 30,
    windowMs: 60_000
  });

  if (rateLimit.allowed) {
    await ToolAnalyticsService.recordAffiliateClick(slug);
  }

  return NextResponse.redirect(tool.affiliateUrl || tool.website, {
    status: 307
  });
}
