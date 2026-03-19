import { handleApiError, noContent, ok } from "@/lib/api";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { FavoriteService } from "@/lib/services/favorite-service";
import { UserService } from "@/lib/services/user-service";

export async function GET(_: Request, { params }: { params: Promise<{ toolId: string }> }) {
  try {
    const session = await requireAuthenticatedSession();
    const user = await UserService.syncSessionUser(session);
    const { toolId } = await params;
    const isFavorited = await FavoriteService.isFavorited(user.id, toolId);

    return ok({ toolId, isFavorited });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ toolId: string }> }) {
  try {
    const session = await requireAuthenticatedSession();
    const user = await UserService.syncSessionUser(session);
    const { toolId } = await params;
    await FavoriteService.removeFavorite(user.id, toolId);

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
