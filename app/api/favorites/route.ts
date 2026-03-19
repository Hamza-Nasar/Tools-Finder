import { NextRequest } from "next/server";
import { created, handleApiError, paginated, parseRequestBody, parseSearchParams } from "@/lib/api";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { FavoriteService } from "@/lib/services/favorite-service";
import { UserService } from "@/lib/services/user-service";
import { createFavoriteSchema, favoriteListQuerySchema } from "@/lib/validators/favorite";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthenticatedSession();
    const user = await UserService.syncSessionUser(session);
    const query = parseSearchParams(request.nextUrl.searchParams, favoriteListQuerySchema);
    const result = await FavoriteService.listFavoritesForUser(user.id, {
      page: query.page ?? 1,
      limit: query.limit ?? 12
    });

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuthenticatedSession();
    const user = await UserService.syncSessionUser(session);
    const payload = await parseRequestBody(request, createFavoriteSchema);
    const favorite = await FavoriteService.addFavorite(user.id, payload.toolId);

    return created(favorite);
  } catch (error) {
    return handleApiError(error);
  }
}
