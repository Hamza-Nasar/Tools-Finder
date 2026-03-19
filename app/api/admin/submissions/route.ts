import { NextRequest } from "next/server";
import { handleApiError, paginated, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { SubmissionService } from "@/lib/services/submission-service";
import { submissionListQuerySchema } from "@/lib/validators/submission";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const query = parseSearchParams(request.nextUrl.searchParams, submissionListQuerySchema);
    const result = await SubmissionService.listSubmissions({
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      q: query.q,
      category: query.category,
      status: query.status
    });

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}
