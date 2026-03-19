import { z } from "zod";
import { paginationQuerySchema, objectIdSchema } from "@/lib/validators/common";

export const createFavoriteSchema = z.object({
  toolId: objectIdSchema
});

export const favoriteListQuerySchema = paginationQuerySchema;
