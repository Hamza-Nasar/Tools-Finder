"use server";

import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { takeRateLimit } from "@/lib/rate-limit/memory-store";
import { submissionFormSchema, submissionFormPayloadSchema } from "@/lib/validators/submission";
import type { ActionState } from "@/lib/actions/action-types";

export async function submitToolAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    website: String(formData.get("website") ?? ""),
    affiliateUrl: String(formData.get("affiliateUrl") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    pricing: String(formData.get("pricing") ?? ""),
    logo: String(formData.get("logo") ?? ""),
    screenshots: String(formData.get("screenshots") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    websiteConfirm: String(formData.get("websiteConfirm") ?? "")
  };

  if (raw.websiteConfirm) {
    return {
      status: "success",
      message: "Submission received and added to the moderation queue."
    };
  }
  const formValidation = submissionFormSchema.safeParse(raw);

  if (!formValidation.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: formValidation.error.flatten().fieldErrors
    };
  }

  const payloadValidation = submissionFormPayloadSchema.safeParse(raw);

  if (!payloadValidation.success) {
    return {
      status: "error",
      message: "Submission payload could not be normalized.",
      fieldErrors: payloadValidation.error.flatten().fieldErrors
    };
  }

  const requestHeaders = await headers();
  const ipAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "anonymous";
  const rateLimit = takeRateLimit(`submission-action:${ipAddress}`, {
    limit: 8,
    windowMs: 60_000
  });

  if (!rateLimit.allowed) {
    return {
      status: "error",
      message: "Too many submissions. Please try again in a minute."
    };
  }

  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);

  await SubmissionService.createSubmission({
    ...payloadValidation.data,
    submittedBy: user.id
  });

  revalidateTag("submissions");
  revalidatePath("/submit");
  revalidatePath("/admin/submissions");

  return {
    status: "success",
    message: "Submission received and added to the moderation queue."
  };
}
