import { z } from "zod";
import { handleApiError, ok, parseRequestBody, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { VendorService } from "@/lib/services/vendor-service";

const listClaimsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional()
});

const updateClaimSchema = z.object({
  claimId: z.string().trim().min(3),
  status: z.enum(["approved", "rejected"]),
  moderationNote: z.string().trim().max(800).optional().nullable()
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, listClaimsSchema);
    const result = await VendorService.listClaims(query);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminSession();
    const payload = await parseRequestBody(request, updateClaimSchema);
    const result = await VendorService.updateClaimStatus(payload);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
