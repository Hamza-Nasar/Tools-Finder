"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { ShortlistService } from "@/lib/services/shortlist-service";
import { toActionState, type ActionState } from "@/lib/actions/action-types";

export async function saveFinderShortlistAction(input: {
  query: string;
  toolIds: string[];
  inferredCategories: string[];
  inferredTags: string[];
}): Promise<ActionState<{ sharePath: string }>> {
  try {
    const session = await requireAuthenticatedSession();
    const user = await UserService.syncSessionUser(session);

    const saved = await ShortlistService.createForUser({
      userId: user.id,
      query: input.query,
      toolIds: input.toolIds,
      inferredCategories: input.inferredCategories,
      inferredTags: input.inferredTags
    });

    revalidatePath("/my-stack");

    return {
      status: "success",
      message: "Shortlist saved.",
      data: {
        sharePath: `/shortlists/${saved.shareSlug}`
      }
    };
  } catch (error) {
    return toActionState<{ sharePath: string }>(error, "Unable to save shortlist.");
  }
}
