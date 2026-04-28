import { z } from "zod";
import { created, handleApiError, ok, parseRequestBody } from "@/lib/api";
import { requirePlanFeature } from "@/lib/access";
import { AlertService } from "@/lib/services/alert-service";

const createAlertSchema = z.object({
  toolSlug: z.string().trim().min(2).optional().nullable(),
  type: z.enum(["price_change", "new_alternative", "score_drop"]),
  thresholdPercent: z.number().min(1).max(100).optional().nullable()
});

export async function GET() {
  try {
    const user = await requirePlanFeature("alerts");
    const alerts = await AlertService.listUserAlerts(user.id);

    return ok({ data: alerts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePlanFeature("alerts");
    const payload = await parseRequestBody(request, createAlertSchema);
    const alert = await AlertService.createAlert({
      userId: user.id,
      toolSlug: payload.toolSlug ?? null,
      type: payload.type,
      thresholdPercent: payload.thresholdPercent ?? null
    });

    return created({ data: alert });
  } catch (error) {
    return handleApiError(error);
  }
}
