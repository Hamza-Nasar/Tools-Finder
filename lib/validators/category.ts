import { z } from "zod";
import { paginationQuerySchema, slugSchema } from "@/lib/validators/common";

const sanitizedString = z.string().trim().min(2).max(120);

export const categoryCreateSchema = z.object({
  name: sanitizedString,
  slug: slugSchema.optional(),
  description: z.string().trim().min(20).max(240)
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required."
);

export const categoryListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional()
});
