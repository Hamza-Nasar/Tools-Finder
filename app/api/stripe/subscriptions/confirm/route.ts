import { NextRequest } from "next/server";
import { handleApiError, ok } from "@/lib/api";
import { requireAuthenticatedUser } from "@/lib/access";
import { AppError } from "@/lib/errors";
import { requireStripe } from "@/lib/stripe";
import { SubscriptionService } from "@/lib/services/subscription-service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { sessionId } = (await request.json()) as { sessionId?: string };

    if (!sessionId) {
      throw new AppError(400, "Missing checkout session id.", "SESSION_ID_REQUIRED");
    }

    const stripe = requireStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== "subscription") {
      throw new AppError(400, "Invalid checkout mode for subscription confirmation.", "INVALID_SESSION_MODE");
    }

    if (session.metadata?.userId !== user.id) {
      throw new AppError(403, "This checkout session does not belong to the authenticated user.", "SESSION_USER_MISMATCH");
    }

    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

    if (!subscriptionId) {
      throw new AppError(400, "Subscription id was not found on checkout session.", "SUBSCRIPTION_ID_MISSING");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = typeof session.customer === "string" ? session.customer : null;

    await SubscriptionService.syncUserSubscriptionFromStripe({
      customerId,
      subscription,
      fallbackUserId: user.id
    });

    const requestedPlan = session.metadata?.requestedPlan;
    const requestedBillingCycle = session.metadata?.requestedBillingCycle;
    if (
      (requestedPlan === "pro" || requestedPlan === "vendor") &&
      (requestedBillingCycle === "monthly" || requestedBillingCycle === "yearly") &&
      (session.amount_total ?? 0) > 0
    ) {
      await SubscriptionService.recordPlanCheckoutPayment({
        userId: user.id,
        plan: requestedPlan,
        billingCycle: requestedBillingCycle,
        stripeSessionId: session.id,
        stripeSubscriptionId: subscriptionId,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        purchaserEmail: session.customer_details?.email ?? session.customer_email ?? user.email ?? null
      });
    }

    return ok({ synced: true });
  } catch (error) {
    return handleApiError(error);
  }
}

