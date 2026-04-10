import { revalidatePath, revalidateTag } from "next/cache";
import { absoluteUrl } from "@/lib/seo";
import { requireStripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getDefaultPaidListingPlan, getListingPlanById } from "@/lib/listing-plans";
import { PaymentRecordModel } from "@/models/PaymentRecord";
import { ToolModel } from "@/models/Tool";
import { FeaturedListingService } from "@/lib/services/featured-listing-service";
import { EmailService } from "@/lib/services/email-service";
import { NotificationService } from "@/lib/services/notification-service";

function getFeaturedListingPriceCents() {
  return env.STRIPE_FEATURED_LISTING_PRICE_CENTS ?? getDefaultPaidListingPlan().priceCents;
}

function getSuccessUrl(slug: string) {
  return absoluteUrl(`/feature/success?session_id={CHECKOUT_SESSION_ID}&slug=${encodeURIComponent(slug)}`);
}

function getCancelUrl(slug: string) {
  return absoluteUrl(`/feature/cancel?slug=${encodeURIComponent(slug)}`);
}

export class PaymentService {
  static async createFeaturedCheckoutSession(input: {
    toolSlug: string;
    planId?: "free" | "monthly" | "quarterly" | "annual";
    customerEmail?: string | null;
  }) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const stripe = requireStripe();
    const plan = getListingPlanById(input.planId ?? "monthly");

    if (!plan.featuredPlacement || !plan.durationDays || plan.priceCents <= 0) {
      throw new AppError(400, "Select a paid featured plan before checkout.", "INVALID_LISTING_PLAN");
    }

    const tool = await ToolModel.findOne(
      {
        slug: input.toolSlug,
        status: "approved"
      },
      {
        _id: 1,
        slug: 1,
        name: 1
      }
    ).lean<{
      _id: { toString(): string };
      slug: string;
      name: string;
    } | null>();

    if (!tool || Array.isArray(tool)) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: getSuccessUrl(tool.slug),
      cancel_url: getCancelUrl(tool.slug),
      customer_email: input.customerEmail ?? undefined,
      allow_promotion_codes: true,
      metadata: {
        toolId: tool._id.toString(),
        toolSlug: tool.slug,
        planId: plan.id,
        planName: plan.name,
        durationDays: String(plan.durationDays),
        purpose: "featured-listing"
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceCents || getFeaturedListingPriceCents(),
            product_data: {
              name: `${plan.name} for ${tool.name}`,
              description: `${plan.durationLabel} of premium homepage and category placement for ${tool.name}`
            }
          }
        }
      ]
    });

    await PaymentRecordModel.findOneAndUpdate(
      { stripeSessionId: session.id },
      {
        $set: {
          toolId: tool._id,
          purchaserEmail: input.customerEmail ?? null,
          planId: plan.id,
          planName: plan.name,
          durationDays: plan.durationDays,
          amountTotal: session.amount_total ?? plan.priceCents,
          currency: session.currency ?? "usd",
          status: "pending"
        },
        $setOnInsert: {
          stripeSessionId: session.id
        }
      },
      { upsert: true, new: true }
    );

    return {
      sessionId: session.id,
      checkoutUrl: session.url
    };
  }

  static async completeFeaturedCheckout(sessionId: string) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const stripe = requireStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const toolId = session.metadata?.toolId;

    if (!toolId) {
      throw new AppError(400, "Stripe session is missing tool metadata.", "INVALID_STRIPE_SESSION");
    }

    const existingRecord = await PaymentRecordModel.findOne({ stripeSessionId: sessionId }).lean<{
      status: "pending" | "paid" | "expired" | "canceled";
      featuredUntil?: Date | null;
      purchaserEmail?: string | null;
      planName?: string | null;
    } | null>();

    if (session.payment_status !== "paid") {
      throw new AppError(400, "Payment has not completed.", "PAYMENT_NOT_COMPLETED");
    }

    const paymentRecord = await FeaturedListingService.activatePaidListing({
      toolId,
      stripeSession: session
    });

    const tool = await ToolModel.findById(
      toolId,
      {
        _id: 1,
        name: 1,
        tagline: 1,
        slug: 1,
        categorySlug: 1,
        featuredUntil: 1,
        createdBy: 1
      }
    ).lean<{
      _id: { toString(): string };
      name: string;
      tagline: string;
      slug: string;
      categorySlug: string;
      featuredUntil?: Date | null;
      createdBy?: { toString(): string } | null;
    } | null>();

    if (!tool || Array.isArray(tool)) {
      throw new AppError(404, "Tool not found after payment.", "TOOL_NOT_FOUND");
    }

    if (!existingRecord || existingRecord.status !== "paid") {
      const featuredUntil =
        paymentRecord?.featuredUntil instanceof Date
          ? paymentRecord.featuredUntil.toISOString()
          : new Date(tool.featuredUntil ?? Date.now()).toISOString();
      const purchaserEmail =
        paymentRecord?.purchaserEmail ??
        session.customer_details?.email ??
        session.customer_email ??
        null;

      if (purchaserEmail) {
        await EmailService.sendFeaturedPurchaseEmail({
          to: purchaserEmail,
          toolName: tool.name,
          featuredUntil,
          planName: existingRecord?.planName ?? session.metadata?.planName ?? undefined,
          manageUrl: absoluteUrl(`/tools/${tool.slug}`)
        });
      }

      if (tool.createdBy) {
        await NotificationService.createNotification({
          userId: tool.createdBy.toString(),
          kind: "featured_listing_activated",
          title: `${tool.name} is now featured`,
          message: `${existingRecord?.planName ?? session.metadata?.planName ?? "Your paid plan"} is active and the listing now has premium placement until ${new Date(featuredUntil).toLocaleDateString()}.`,
          href: `/tools/${tool.slug}`
        });
      }
    }

    revalidateTag("tools");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/tools");
    revalidatePath(`/tools/${tool.slug}`);
    revalidatePath(`/categories/${tool.categorySlug}`);
    revalidatePath("/admin");
    revalidatePath("/admin/tools");
    revalidatePath("/dashboard");

    return {
      session,
      tool
    };
  }

  static async markCheckoutCanceled(sessionId: string) {
    await connectToDatabase();

    await PaymentRecordModel.updateOne(
      { stripeSessionId: sessionId },
      {
        $set: {
          status: "canceled"
        }
      }
    );
  }

  static async handleStripeWebhook(requestBody: string, signature: string | null) {
    const stripe = requireStripe();

    if (!env.STRIPE_WEBHOOK_SECRET || !signature) {
      throw new AppError(400, "Stripe webhook secret or signature is missing.", "INVALID_STRIPE_WEBHOOK");
    }

    const event = stripe.webhooks.constructEvent(requestBody, signature, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await this.completeFeaturedCheckout(session.id);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;
        await this.markCheckoutCanceled(session.id);
        break;
      }
      default:
        break;
    }

    return event;
  }
}
