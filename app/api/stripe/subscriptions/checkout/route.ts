import { z } from "zod";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { requireAuthenticatedUser } from "@/lib/access";
import { AppError } from "@/lib/errors";
import { SubscriptionService } from "@/lib/services/subscription-service";

const subscriptionCheckoutSchema = z.object({
  plan: z.enum(["pro", "vendor"]),
  billingCycle: z.enum(["monthly", "yearly"])
});

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, subscriptionCheckoutSchema);
    const user = await requireAuthenticatedUser();
    const userEmail = user.email?.trim();

    if (!userEmail) {
      throw new AppError(400, "Authenticated account is missing an email address.", "INVALID_ACCOUNT");
    }

    const checkout = await SubscriptionService.createSubscriptionCheckoutSession({
      userId: user.id,
      userEmail,
      selection: payload
    });

    return created(checkout);
  } catch (error) {
    return handleApiError(error);
  }
}
