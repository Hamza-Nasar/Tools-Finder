import { NextRequest } from "next/server";
import { z } from "zod";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { getOptionalSession } from "@/lib/server-guards";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { PaymentService } from "@/lib/services/payment-service";
import { UserService } from "@/lib/services/user-service";
import { slugSchema } from "@/lib/validators/common";

const featuredCheckoutSchema = z.object({
  toolSlug: slugSchema,
  customerEmail: z.string().email().optional().nullable()
});

function getIpAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await takeRateLimit(`stripe-checkout:${getIpAddress(request)}`, {
      limit: 10,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many checkout attempts. Please try again in a minute.",
          code: "RATE_LIMITED"
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const payload = await parseRequestBody(request, featuredCheckoutSchema);
    const session = await getOptionalSession();
    const user = session?.user ? await UserService.syncSessionUser(session) : null;
    const checkout = await PaymentService.createFeaturedCheckoutSession({
      toolSlug: payload.toolSlug,
      customerEmail: payload.customerEmail ?? user?.email ?? session?.user?.email ?? null
    });

    return created(checkout);
  } catch (error) {
    return handleApiError(error);
  }
}
