"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { Submission } from "@/types";
import type { ActionState } from "@/lib/actions/action-types";
import { toActionState } from "@/lib/actions/action-types";
import { requireAdminSession } from "@/lib/server-guards";
import { SubmissionService } from "@/lib/services/submission-service";
import { UserService } from "@/lib/services/user-service";
import { updateSubmissionSchema } from "@/lib/validators/submission";

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSubmissionFormInput(formData: FormData) {
  const intent = String(formData.get("intent") ?? "save").trim();
  const status =
    intent === "approve" ? "approved" : intent === "reject" ? "rejected" : undefined;

  return {
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    affiliateUrl: String(formData.get("affiliateUrl") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    tags: parseList(formData.get("tags")),
    pricing: String(formData.get("pricing") ?? "").trim(),
    logo: String(formData.get("logo") ?? "").trim() || null,
    screenshots: parseList(formData.get("screenshots")),
    contactEmail: String(formData.get("contactEmail") ?? "").trim() || null,
    moderationNote: String(formData.get("moderationNote") ?? "").trim() || null,
    status
  };
}

export async function updateSubmissionAction(id: string, input: unknown) {
  const session = await requireAdminSession();
  const user = await UserService.syncSessionUser(session);
  const payload = updateSubmissionSchema.parse(input);
  const submission = await SubmissionService.updateSubmission(id, payload, user.id);

  revalidateTag("submissions");
  revalidateTag("tools");
  revalidateTag("categories");
  revalidatePath("/submit");
  revalidatePath("/dashboard");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  if (submission.approvedToolId) {
    revalidatePath(`/tools/${submission.slug}`);
  }

  return submission;
}

export async function deleteSubmissionAction(id: string) {
  await requireAdminSession();
  await SubmissionService.deleteSubmission(id);

  revalidateTag("submissions");
  revalidatePath("/admin/submissions");
}

export async function submissionReviewFormAction(
  id: string,
  _: ActionState<Submission>,
  formData: FormData
): Promise<ActionState<Submission>> {
  try {
    const submission = await updateSubmissionAction(id, getSubmissionFormInput(formData));

    return {
      status: "success",
      message:
        submission.status === "approved"
          ? "Submission approved and synced to the catalog."
          : submission.status === "rejected"
            ? "Submission rejected."
            : "Submission updated.",
      data: submission
    };
  } catch (error) {
    return toActionState<Submission>(error, "Unable to review the submission.");
  }
}

export async function deleteSubmissionFormAction(id: string): Promise<ActionState> {
  try {
    await deleteSubmissionAction(id);

    return {
      status: "success",
      message: "Submission deleted."
    };
  } catch (error) {
    return toActionState(error, "Unable to delete the submission.");
  }
}
