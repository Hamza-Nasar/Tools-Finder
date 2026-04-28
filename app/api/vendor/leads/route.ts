import { z } from "zod";
import { created, handleApiError, parseRequestBody } from "@/lib/api";
import { VendorService } from "@/lib/services/vendor-service";

const createLeadSchema = z.object({
  toolSlug: z.string().trim().min(2),
  sourcePath: z.string().trim().min(1),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().email(),
  useCase: z.string().trim().min(8).max(1200),
  budget: z.enum(["unknown", "under_50", "50_200", "200_plus"]).optional()
});

export async function POST(request: Request) {
  try {
    const payload = await parseRequestBody(request, createLeadSchema);
    const lead = await VendorService.createVendorLead(payload);

    return created({ data: lead });
  } catch (error) {
    return handleApiError(error);
  }
}
