import type Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { getDefaultPaidListingPlan, getListingPlanById } from "@/lib/listing-plans";
import { toObjectId } from "@/lib/object-id";
import { PaymentRecordModel } from "@/models/PaymentRecord";
import { ToolModel } from "@/models/Tool";

declare global {
  var featuredExpirySweepAt: number | undefined;
}

const SWEEP_WINDOW_MS = 60_000;

export function getFeaturedListingDurationDays() {
  return env.STRIPE_FEATURED_LISTING_DURATION_DAYS ?? getDefaultPaidListingPlan().durationDays ?? 30;
}

export function getActiveFeaturedFilter(now = new Date()) {
  return {
    featured: true,
    $or: [{ featuredUntil: null }, { featuredUntil: { $gte: now } }]
  };
}

export class FeaturedListingService {
  static async expireListingsIfNeeded() {
    await connectToDatabase();

    const nowMs = Date.now();

    if (global.featuredExpirySweepAt && nowMs - global.featuredExpirySweepAt < SWEEP_WINDOW_MS) {
      return;
    }

    const now = new Date();

    await Promise.all([
      ToolModel.updateMany(
        {
          featured: true,
          featuredUntil: { $lt: now }
        },
        {
          $set: {
            featured: false,
            featureSource: null,
            featuredUntil: null
          }
        }
      ),
      PaymentRecordModel.updateMany(
        {
          status: "paid",
          featuredUntil: { $lt: now }
        },
        {
          $set: {
            status: "expired"
          }
        }
      )
    ]);

    global.featuredExpirySweepAt = nowMs;
  }

  static async setManualFeatured(toolId: string, featured: boolean) {
    await connectToDatabase();

    await ToolModel.updateOne(
      { _id: toObjectId(toolId, "toolId") },
      {
        $set: featured
          ? {
              featured: true,
              featureSource: "manual",
              featuredUntil: null
            }
          : {
              featured: false,
              featureSource: null,
              featuredUntil: null
            }
      }
    );
  }

  static async activatePaidListing({
    toolId,
    stripeSession,
    sessionIdOverride
  }: {
    toolId: string;
    stripeSession?: Stripe.Checkout.Session;
    sessionIdOverride?: string;
  }) {
    await connectToDatabase();

    const objectId = toObjectId(toolId, "toolId");
    const planId = (stripeSession?.metadata?.planId as "free" | "monthly" | "quarterly" | "annual" | undefined) ?? "monthly";
    const plan = getListingPlanById(planId);
    const durationDays = plan.durationDays ?? getFeaturedListingDurationDays();
    const currentTool = await ToolModel.findById(objectId)
      .select({ featuredUntil: 1 })
      .lean<{ featuredUntil?: Date | null } | null>();
    const featuredFrom =
      currentTool?.featuredUntil && currentTool.featuredUntil > new Date() ? new Date(currentTool.featuredUntil) : new Date();
    const featuredUntil = new Date(featuredFrom);
    featuredUntil.setUTCDate(featuredUntil.getUTCDate() + durationDays);

    const sessionId = stripeSession?.id ?? sessionIdOverride;

    if (!sessionId) {
      throw new AppError(400, "Missing Stripe session identifier.", "MISSING_STRIPE_SESSION");
    }

    const paymentRecord = await PaymentRecordModel.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        $set: {
          toolId: objectId,
          stripePaymentIntentId:
            typeof stripeSession?.payment_intent === "string" ? stripeSession.payment_intent : null,
          purchaserEmail: stripeSession?.customer_details?.email ?? stripeSession?.customer_email ?? null,
          planId: plan.id,
          planName: plan.name,
          durationDays,
          amountTotal: stripeSession?.amount_total ?? 0,
          currency: stripeSession?.currency ?? "usd",
          status: "paid",
          featuredFrom,
          featuredUntil
        },
        $setOnInsert: {
          stripeSessionId: sessionId
        }
      },
      {
        upsert: true,
        new: true
      }
    ).lean<{
      featuredUntil?: Date | null;
      purchaserEmail?: string | null;
      planId?: string | null;
      planName?: string | null;
      durationDays?: number | null;
      status: "pending" | "paid" | "expired" | "canceled";
    } | null>();

    await ToolModel.updateOne(
      { _id: objectId },
      {
        $set: {
          featured: true,
          featureSource: "stripe",
          featuredUntil
        }
      }
    );

    return paymentRecord;
  }

  static async getRevenueOverview() {
    await connectToDatabase();
    await this.expireListingsIfNeeded();

    const [revenueTotals, paidCount, activeFeaturedCount, recentPayments] = await Promise.all([
      PaymentRecordModel.aggregate<{ _id: string; totalRevenue: number }>([
        { $match: { status: "paid" } },
        { $group: { _id: "$currency", totalRevenue: { $sum: "$amountTotal" } } }
      ]),
      PaymentRecordModel.countDocuments({ status: "paid" }),
      ToolModel.countDocuments(getActiveFeaturedFilter()),
      PaymentRecordModel.find({ status: "paid" })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    return {
      totals: revenueTotals.map((row) => ({
        currency: row._id,
        totalRevenue: row.totalRevenue,
        paidFeaturedListings: paidCount,
        activeFeaturedListings: activeFeaturedCount
      })),
      recentPayments
    };
  }
}
