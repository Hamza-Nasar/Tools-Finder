import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { hasPlanFeature, normalizeUserPlan, type PlanFeature } from "@/lib/plans";

export async function requireAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AppError(401, "Please sign in to continue.", "UNAUTHORIZED");
  }

  return session.user;
}

export async function requirePlanFeature(feature: PlanFeature) {
  const user = await requireAuthenticatedUser();
  const plan = normalizeUserPlan(user.plan);

  if (!hasPlanFeature(plan, feature)) {
    throw new AppError(403, `This feature requires an upgraded plan. Missing: ${feature}.`, "PLAN_UPGRADE_REQUIRED");
  }

  return user;
}
