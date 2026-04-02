import { z } from "zod";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { UserService } from "@/lib/services/user-service";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[0-9]/, "Password must include a number.")
});

function getIpAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, registerSchema);
    const rateLimit = await takeRateLimit(`auth-register:${getIpAddress(request)}`, {
      limit: 5,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many signup attempts. Please wait a minute and try again.",
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

    const user = await UserService.registerWithPassword(payload);

    return created({
      user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
