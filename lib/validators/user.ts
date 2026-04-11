import { z } from "zod";
import { paginationQuerySchema } from "@/lib/validators/common";

export const userRoleSchema = z.enum(["user", "admin"]);

export const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const userListQuerySchema = paginationQuerySchema.extend({
  role: userRoleSchema.optional(),
  q: z.string().trim().optional()
});

export const adminInviteCreateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email()
});

export const adminUpdateUserRoleSchema = z.object({
  role: userRoleSchema
});

export const adminInviteAcceptSchema = z.object({
  token: z.string().trim().min(32),
  name: z.string().trim().min(2).max(80).optional(),
  password: passwordSchema.optional()
});

export const firstAdminSetupSchema = z.object({
  token: z.string().trim().min(16),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: passwordSchema
});
