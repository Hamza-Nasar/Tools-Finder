"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { NotificationService } from "@/lib/services/notification-service";
import { UserService } from "@/lib/services/user-service";

export async function markNotificationsReadAction() {
  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);

  await NotificationService.markAllReadForUser(user.id);
  revalidatePath("/dashboard");
}
