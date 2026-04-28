import { z } from "zod";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { requirePlanFeature } from "@/lib/access";
import { VendorService } from "@/lib/services/vendor-service";

const createClaimSchema = z.object({
  toolSlug: z.string().trim().min(2),
  companyEmail: z.string().email(),
  message: z.string().trim().max(600).optional().nullable()
});

export async function POST(request: Request) {
  try {
    const user = await requirePlanFeature("vendor_claim");
    const payload = await parseRequestBody(request, createClaimSchema);
    const claim = await VendorService.createToolClaim({
      userId: user.id,
      toolSlug: payload.toolSlug,
      companyEmail: payload.companyEmail,
      message: payload.message ?? null
    });

    return created({ data: claim });
  } catch (error) {
    return handleApiError(error);
  }
}
