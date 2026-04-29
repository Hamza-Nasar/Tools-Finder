import type Stripe from "stripe";
import { revalidatePath } from "next/cache";
import { absoluteUrl } from "@/lib/seo";
import { requireStripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { UserModel } from "@/models/User";
import { normalizeUserPlan } from "@/lib/plans";
import type { UserPlan } from "@/types";
import { EmailService } from "@/lib/services/email-service";

type BillingCycle = "monthly" | "yearly";

interface PlanSelection {
  plan: UserPlan;
  billingCycle: BillingCycle;
}

const PLAN_PRICE_DEFAULTS: Record<UserPlan, Record<BillingCycle, number>> = {
  free: {
    monthly: 0,
    yearly: 0
  },
  pro: {
    monthly: 1900,
    yearly: 19000
  },
  vendor: {
    monthly: 9900,
    yearly: 99000
  }
};

function getPlanPriceId(selection: PlanSelection) {
  if (selection.plan === "pro" && selection.billingCycle === "monthly") {
    return env.STRIPE_PRO_MONTHLY_PRICE_ID;
  }

  if (selection.plan === "pro" && selection.billingCycle === "yearly") {
    return env.STRIPE_PRO_YEARLY_PRICE_ID;
  }

  if (selection.plan === "vendor" && selection.billingCycle === "monthly") {
    return env.STRIPE_VENDOR_MONTHLY_PRICE_ID;
  }

  if (selection.plan === "vendor" && selection.billingCycle === "yearly") {
    return env.STRIPE_VENDOR_YEARLY_PRICE_ID;
  }

  return undefined;
}

function getPlanAmountCents(selection: PlanSelection) {
  return PLAN_PRICE_DEFAULTS[selection.plan][selection.billingCycle];
}

function getPlanProductLabel(selection: PlanSelection) {
  const planLabel = selection.plan === "pro" ? "Pro" : "Vendor";
  const cycleLabel = selection.billingCycle === "yearly" ? "Yearly" : "Monthly";

  return `${planLabel} plan (${cycleLabel})`;
}

function getSubscriptionUrls() {
  return {
    successUrl: absoluteUrl("/dashboard?billing=success"),
    cancelUrl: absoluteUrl("/dashboard?billing=cancel")
  };
}

function resolvePlanFromPriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  if (priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID) {
    return { plan: "pro" as const, billingCycle: "monthly" as const };
  }

  if (priceId === env.STRIPE_PRO_YEARLY_PRICE_ID) {
    return { plan: "pro" as const, billingCycle: "yearly" as const };
  }

  if (priceId === env.STRIPE_VENDOR_MONTHLY_PRICE_ID) {
    return { plan: "vendor" as const, billingCycle: "monthly" as const };
  }

  if (priceId === env.STRIPE_VENDOR_YEARLY_PRICE_ID) {
    return { plan: "vendor" as const, billingCycle: "yearly" as const };
  }

  return null;
}

function resolvePlanFromSubscription(subscription: Stripe.Subscription) {
  const metadataPlan = subscription.metadata?.requestedPlan;
  const metadataCycle = subscription.metadata?.requestedBillingCycle;

  if (
    (metadataPlan === "pro" || metadataPlan === "vendor") &&
    (metadataCycle === "monthly" || metadataCycle === "yearly")
  ) {
    return {
      plan: metadataPlan,
      billingCycle: metadataCycle
    };
  }

  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id;
  const fromPriceId = resolvePlanFromPriceId(priceId);

  if (fromPriceId) {
    return fromPriceId;
  }

  const interval = firstItem?.price?.recurring?.interval;
  const intervalCount = firstItem?.price?.recurring?.interval_count ?? 1;
  const inferredCycle: BillingCycle | null =
    interval === "year" || (interval === "month" && intervalCount >= 12)
      ? "yearly"
      : interval === "month"
        ? "monthly"
        : null;

  if (!inferredCycle) {
    return null;
  }

  const amount = firstItem?.price?.unit_amount ?? 0;

  if (amount >= PLAN_PRICE_DEFAULTS.vendor.monthly) {
    return { plan: "vendor", billingCycle: inferredCycle };
  }

  if (amount > 0) {
    return { plan: "pro", billingCycle: inferredCycle };
  }

  return null;
}

function getTrialEndIso(trialEnd: number | null | undefined) {
  if (!trialEnd) {
    return null;
  }

  return new Date(trialEnd * 1000).toISOString();
}

export class SubscriptionService {
  static async createSubscriptionCheckoutSession(input: {
    userId: string;
    userEmail: string;
    selection: PlanSelection;
  }) {
    await connectToDatabase();
    const stripe = requireStripe();
    const priceId = getPlanPriceId(input.selection);
    const amountCents = getPlanAmountCents(input.selection);

    const urls = getSubscriptionUrls();
    const existingUser = await UserModel.findById(input.userId, {
      stripeCustomerId: 1
    }).lean<{ stripeCustomerId?: string | null } | null>();

    if (!existingUser) {
      throw new AppError(404, "User not found.", "USER_NOT_FOUND");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
      customer: existingUser.stripeCustomerId ?? undefined,
      customer_email: existingUser.stripeCustomerId ? undefined : input.userEmail,
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: amountCents,
                recurring: {
                  interval: input.selection.billingCycle === "yearly" ? "year" : "month"
                },
                product_data: {
                  name: getPlanProductLabel(input.selection),
                  description:
                    input.selection.plan === "vendor"
                      ? "Vendor growth plan for claimed profiles, analytics, and priority lead routing."
                      : "Pro plan for advanced compare depth, saved stacks, and workflow alerts."
                }
              }
            }
      ],
      allow_promotion_codes: true,
      metadata: {
        userId: input.userId,
        purpose: "plan-subscription",
        requestedPlan: input.selection.plan,
        requestedBillingCycle: input.selection.billingCycle
      },
      subscription_data: {
        metadata: {
          userId: input.userId,
          requestedPlan: input.selection.plan,
          requestedBillingCycle: input.selection.billingCycle
        }
      }
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url
    };
  }

  static async syncUserSubscriptionFromStripe(input: {
    customerId?: string | null;
    subscription: Stripe.Subscription;
    fallbackUserId?: string | null;
  }) {
    await connectToDatabase();
    const planSelection = resolvePlanFromSubscription(input.subscription);
    const stripeCustomerId = input.customerId ?? (typeof input.subscription.customer === "string" ? input.subscription.customer : null);
    const stripeSubscriptionId = input.subscription.id;
    const trialEndsAt = getTrialEndIso(input.subscription.trial_end);

    const query =
      input.fallbackUserId != null
        ? { _id: input.fallbackUserId }
        : stripeCustomerId
          ? { stripeCustomerId }
          : null;

    if (!query) {
      throw new AppError(400, "Cannot resolve subscription owner.", "SUBSCRIPTION_OWNER_MISSING");
    }

    const user = await UserModel.findOne(query, {
      _id: 1
    }).lean<{ _id: { toString(): string } } | null>();

    if (!user) {
      throw new AppError(404, "Subscription owner not found.", "SUBSCRIPTION_OWNER_NOT_FOUND");
    }

    const existingUser = await UserModel.findById(user._id, {
      email: 1,
      plan: 1,
      billingCycle: 1
    }).lean<{ email?: string | null; plan?: UserPlan; billingCycle?: BillingCycle | null } | null>();

    if (input.subscription.status === "canceled" || input.subscription.status === "unpaid" || input.subscription.status === "incomplete_expired") {
      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            plan: "free",
            billingCycle: null,
            stripeCustomerId,
            stripeSubscriptionId: null,
            trialEndsAt: null,
            updatedAt: new Date()
          }
        }
      );
    } else {
      const nextPlan = normalizeUserPlan(planSelection?.plan);
      const nextCycle: BillingCycle | null =
        planSelection?.billingCycle === "monthly" || planSelection?.billingCycle === "yearly"
          ? planSelection.billingCycle
          : null;

      await UserModel.updateOne(
        { _id: user._id },
        {
          $set: {
            plan: nextPlan,
            billingCycle: nextCycle,
            stripeCustomerId,
            stripeSubscriptionId,
            trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : null,
            updatedAt: new Date()
          }
        }
      );

      const wasDifferentPlan = existingUser && (existingUser.plan !== nextPlan || existingUser.billingCycle !== nextCycle);

      if (wasDifferentPlan && existingUser.email && (nextPlan === "pro" || nextPlan === "vendor") && nextCycle) {
        await EmailService.sendPlanUpgradedEmail({
          to: existingUser.email,
          plan: nextPlan,
          billingCycle: nextCycle
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/my-stack");
    revalidatePath("/admin");
    revalidatePath("/admin/growth");
    revalidatePath("/admin/users");
  }

  static async cancelUserSubscriptionByCustomerId(customerId: string) {
    await connectToDatabase();

    await UserModel.updateOne(
      { stripeCustomerId: customerId },
      {
        $set: {
          plan: "free",
          billingCycle: null,
          stripeSubscriptionId: null,
          trialEndsAt: null,
          updatedAt: new Date()
        }
      }
    );

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/growth");
    revalidatePath("/admin/users");
  }
}
