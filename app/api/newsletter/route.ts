import { z } from "zod";
import { created, handleApiError, ok, parseRequestBody } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { NewsletterService } from "@/lib/services/newsletter-service";

const newsletterPayloadSchema = z.object({
  email: z.string().trim().email(),
  source: z.enum(["homepage", "tool-page", "exit-intent"]),
  pagePath: z
    .string()
    .trim()
    .max(200)
    .optional()
    .refine((value) => !value || value.startsWith("/"), "pagePath must start with /"),
  toolSlug: z.string().trim().max(120).optional()
});

function getIpAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, newsletterPayloadSchema);
    const rateLimit = await takeRateLimit(`newsletter:${getIpAddress(request)}`, {
      limit: 6,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return ok({
        subscribed: false,
        limited: true
      });
    }

    const subscription = await NewsletterService.subscribe(payload);

    return created({
      subscribed: true,
      email: subscription.email
    });
  } catch (error) {
    return handleApiError(error);
  }
}
