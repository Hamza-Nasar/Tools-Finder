import type { UserPlan } from "@/types";

export type PlanFeature =
  | "advanced_compare"
  | "saved_stacks"
  | "alerts"
  | "vendor_claim"
  | "vendor_analytics"
  | "priority_leads";

const planFeatureMap: Record<UserPlan, Set<PlanFeature>> = {
  free: new Set<PlanFeature>(),
  pro: new Set<PlanFeature>(["advanced_compare", "saved_stacks", "alerts"]),
  vendor: new Set<PlanFeature>([
    "advanced_compare",
    "saved_stacks",
    "alerts",
    "vendor_claim",
    "vendor_analytics",
    "priority_leads"
  ])
};

export function normalizeUserPlan(input: string | null | undefined): UserPlan {
  if (input === "pro" || input === "vendor" || input === "free") {
    return input;
  }

  return "free";
}

export function hasPlanFeature(plan: UserPlan, feature: PlanFeature) {
  return planFeatureMap[plan].has(feature);
}

export function isPaidPlan(plan: UserPlan) {
  return plan === "pro" || plan === "vendor";
}
