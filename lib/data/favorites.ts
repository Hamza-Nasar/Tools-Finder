import { cache } from "react";
import { FavoriteService } from "@/lib/services/favorite-service";

export const getFavoritesForUser = cache(async (userId: string, page = 1, limit = 12) =>
  FavoriteService.listFavoritesForUser(userId, { page, limit })
);
