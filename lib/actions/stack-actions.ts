"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/actions/action-types";
import { toActionState } from "@/lib/actions/action-types";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { StackService } from "@/lib/services/stack-service";
import { UserService } from "@/lib/services/user-service";
import { stackDetailsSchema } from "@/lib/validators/stack";

async function requireStackUser() {
  const session = await requireAuthenticatedSession();
  return UserService.syncSessionUser(session);
}

export async function addToolToStackAction(toolId: string) {
  const user = await requireStackUser();
  await StackService.addTool(user.id, toolId);
  revalidatePath("/my-stack");
}

export async function removeToolFromStackAction(toolId: string) {
  const user = await requireStackUser();
  await StackService.removeTool(user.id, toolId);
  revalidatePath("/my-stack");
}

export async function saveStackDetailsAction(
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const user = await requireStackUser();
    const parsed = stackDetailsSchema.parse({
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? "")
    });

    await StackService.updateStackDetails(user.id, parsed);
    revalidatePath("/my-stack");

    return {
      status: "success",
      message: "Stack saved."
    };
  } catch (error) {
    return toActionState(error, "Unable to save your stack.");
  }
}
