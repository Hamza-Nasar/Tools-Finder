import type { ListingPlan } from "@/types";
import { formatCurrencyFromCents } from "@/lib/utils";

const LISTING_PLAN_CONFIG = [
  {
    id: "free",
    name: "Free Listing",
    priceCents: 0,
    durationDays: null,
    description: "A normal approved directory listing with moderation and dashboard tracking.",
    featuredPlacement: false,
    highlights: [
      "Permanent standard listing after approval",
      "Appears in search and category pages",
      "No homepage or featured slot priority"
    ]
  },
  {
    id: "monthly",
    name: "Monthly Boost",
    priceCents: 4900,
    durationDays: 30,
    description: "A focused paid push for launches, campaigns, and short-term acquisition experiments.",
    featuredPlacement: true,
    highlights: [
      "Homepage featured placement",
      "Category spotlight placement",
      "Best for monthly launch pushes"
    ]
  },
  {
    id: "quarterly",
    name: "Quarterly Growth",
    priceCents: 12900,
    durationDays: 90,
    description: "Longer paid visibility for tools that want repeated discovery across a full quarter.",
    featuredPlacement: true,
    highlights: [
      "Featured placement for 90 days",
      "Better value than paying monthly three times",
      "Good for steady founder growth"
    ]
  },
  {
    id: "annual",
    name: "Annual Dominance",
    priceCents: 39900,
    durationDays: 365,
    description: "The highest-visibility option for tools that want year-round premium distribution.",
    featuredPlacement: true,
    highlights: [
      "Featured placement for 1 year",
      "Strongest long-term directory presence",
      "Best value per day"
    ]
  }
] satisfies Array<Omit<ListingPlan, "priceLabel" | "durationLabel" | "summaryLabel">>;

function formatDurationLabel(durationDays: number | null) {
  if (durationDays === null) {
    return "No expiry";
  }

  if (durationDays === 365) {
    return "1 year";
  }

  if (durationDays === 30) {
    return "30 days";
  }

  if (durationDays === 90) {
    return "90 days";
  }

  return durationDays === 1 ? "1 day" : `${durationDays} days`;
}

export function getListingPlans(): ListingPlan[] {
  return LISTING_PLAN_CONFIG.map((plan) => {
    const durationLabel = formatDurationLabel(plan.durationDays);
    const priceLabel = plan.priceCents > 0 ? formatCurrencyFromCents(plan.priceCents) : "Free";

    return {
      ...plan,
      priceLabel,
      durationLabel,
      summaryLabel: plan.priceCents > 0 ? `${priceLabel} for ${durationLabel}` : "Free after approval"
    };
  });
}

export function getPaidListingPlans() {
  return getListingPlans().filter((plan) => plan.priceCents > 0);
}

export function getListingPlanById(planId: ListingPlan["id"]) {
  const plan = getListingPlans().find((entry) => entry.id === planId);

  if (!plan) {
    return getPaidListingPlans()[0];
  }

  return plan;
}

export function getDefaultPaidListingPlan() {
  return getPaidListingPlans()[0];
}
