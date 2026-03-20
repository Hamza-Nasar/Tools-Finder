import { z } from "zod";

export const stackDetailsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().nullable()
});
