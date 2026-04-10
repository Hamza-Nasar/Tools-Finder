import { NextRequest, NextResponse } from "next/server";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { ToolDiscoveryService } from "@/lib/services/tool-discovery-service";

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function GET(request: NextRequest) {
  try {
    const ipAddress = getIpAddress(request);
    const rateLimit = await takeRateLimit(`tool-live-feed:${ipAddress}`, {
      limit: 24,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded.",
          code: "RATE_LIMITED"
        },
        {
          status: 429
        }
      );
    }

    const payload = await ToolDiscoveryService.getLiveDiscoveryFeed(6);

    return NextResponse.json(payload, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected live discovery failure.";

    return NextResponse.json(
      {
        error: message,
        code: "LIVE_DISCOVERY_ERROR"
      },
      { status: 500 }
    );
  }
}
