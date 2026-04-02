import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { created, handleApiError, paginated, parseRequestBody, parseSearchParams } from "@/lib/api";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { requireAdminSession, requireAuthenticatedSession } from "@/lib/server-guards";
import { SubmissionService } from "@/lib/services/submission-service";
import { UserService } from "@/lib/services/user-service";
import { createSubmissionSchema, submissionListQuerySchema } from "@/lib/validators/submission";

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

export async function POST(request: NextRequest) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";
    const rateLimit = await takeRateLimit(`submission:${ipAddress}`, {
      limit: 8,
      windowMs: 60_000
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: "Too many submissions. Please try again in a minute.",
          code: "RATE_LIMITED"
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetAt)
          }
        }
      );
    }

    const payload = await parseRequestBody(request, createSubmissionSchema);
    const session = await requireAuthenticatedSession();
    const user = await UserService.syncSessionUser(session);
    const submission = await SubmissionService.createSubmission({
      ...payload,
      submittedBy: user.id
    });

    revalidateTag("submissions");
    revalidatePath("/submit");
    revalidatePath("/admin/submissions");

    return created(submission, {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
