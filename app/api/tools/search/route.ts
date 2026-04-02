import { NextRequest, NextResponse } from "next/server";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { parseSearchParams } from "@/lib/api";
import { ToolDiscoveryService } from "@/lib/services/tool-discovery-service";
import { hybridToolSearchQuerySchema } from "@/lib/validators/tool";

export const runtime = "nodejs";

function toTags(value?: string) {
  return value
    ?.split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

function serializeEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: NextRequest) {
  try {
    const ipAddress = getIpAddress(request);
    const rateLimit = await takeRateLimit(`tool-hybrid-search:${ipAddress}`, {
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

    const query = parseSearchParams(request.nextUrl.searchParams, hybridToolSearchQuerySchema);
    const searchOptions = {
      q: query.q,
      category: query.category,
      tags: toTags(query.tags) ?? (query.tag ? [query.tag.toLowerCase()] : undefined),
      pricing: query.pricing,
      sort: query.sort,
      featured: query.featured,
      recent: query.recent,
      limit: query.limit
    };

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        void (async () => {
          try {
            const externalPromise = ToolDiscoveryService.searchExternal(searchOptions);
            const local = await ToolDiscoveryService.searchLocal(searchOptions);
            controller.enqueue(encoder.encode(serializeEvent("local", local)));

            const web = await externalPromise;
            controller.enqueue(encoder.encode(serializeEvent("web", web)));
            controller.enqueue(encoder.encode(serializeEvent("complete", { ok: true })));
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unexpected search failure.";
            controller.enqueue(
              encoder.encode(
                serializeEvent("error", {
                  error: message
                })
              )
            );
          } finally {
            controller.close();
          }
        })();
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected search failure.";

    return NextResponse.json(
      {
        error: message,
        code: "HYBRID_SEARCH_ERROR"
      },
      { status: 500 }
    );
  }
}
