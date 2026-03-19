"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { FavoriteService } from "@/lib/services/favorite-service";
import { UserService } from "@/lib/services/user-service";

export async function toggleFavoriteAction(toolId: string, pathsToRevalidate: string[] = ["/favorites"]) {
  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);
  const isFavorited = await FavoriteService.isFavorited(user.id, toolId);

  if (isFavorited) {
    await FavoriteService.removeFavorite(user.id, toolId);
  } else {
    await FavoriteService.addFavorite(user.id, toolId);
  }

  for (const path of pathsToRevalidate) {
    revalidatePath(path);
  }

  return { isFavorited: !isFavorited };
}
