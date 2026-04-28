import { handleApiError, ok } from "@/lib/api";
import { requireAuthenticatedUser } from "@/lib/access";
import { normalizeUserPlan } from "@/lib/plans";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();

    return ok({
      plan: normalizeUserPlan(user.plan),
      billingCycle: user.billingCycle ?? null,
      trialEndsAt: user.trialEndsAt ?? null
    });
  } catch (error) {
    return handleApiError(error);
  }
}
