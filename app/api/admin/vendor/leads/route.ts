import { z } from "zod";
import { handleApiError, ok, parseRequestBody, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { VendorService } from "@/lib/services/vendor-service";

const listLeadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["new", "contacted", "qualified", "closed"]).optional()
});

const updateLeadSchema = z.object({
  leadId: z.string().trim().min(3),
  status: z.enum(["new", "contacted", "qualified", "closed"])
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const query = parseSearchParams(searchParams, listLeadsSchema);
    const result = await VendorService.listLeads(query);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminSession();
    const payload = await parseRequestBody(request, updateLeadSchema);
    const result = await VendorService.updateLeadStatus(payload);

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
