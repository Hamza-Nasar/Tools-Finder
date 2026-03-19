import { z } from "zod";
import { paginationQuerySchema } from "@/lib/validators/common";

export const userListQuerySchema = paginationQuerySchema.extend({
  role: z.enum(["user", "admin"]).optional(),
  q: z.string().trim().optional()
});
