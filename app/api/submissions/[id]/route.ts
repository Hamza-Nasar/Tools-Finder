import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { handleApiError, noContent, ok, parseRequestBody } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { SubmissionService } from "@/lib/services/submission-service";
import { UserService } from "@/lib/services/user-service";
import { updateSubmissionSchema } from "@/lib/validators/submission";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const submission = await SubmissionService.getSubmissionById(id);

    return ok(submission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession();
    const user = await UserService.syncSessionUser(session);
    const { id } = await params;
    const payload = await parseRequestBody(request, updateSubmissionSchema);
    const submission = await SubmissionService.updateSubmission(id, payload, user.id);

    revalidateTag("submissions");
    revalidateTag("tools");
    revalidateTag("categories");
    revalidatePath("/submit");
    revalidatePath("/admin/submissions");
    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    if (submission.approvedToolId) {
      revalidatePath(`/tools/${submission.slug}`);
    }

    return ok(submission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await SubmissionService.deleteSubmission(id);

    revalidateTag("submissions");
    revalidatePath("/admin/submissions");

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
