import { z } from "zod";
import { pricingOptions, skillLevelOptions, toolOutputTypeOptions, toolPlatformOptions, toolStatusOptions } from "@/lib/constants";
import { booleanSearchParamSchema, paginationQuerySchema, slugSchema } from "@/lib/validators/common";

export const toolBaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(140),
  website: z.string().url(),
  affiliateUrl: z.string().url().optional().nullable(),
  description: z.string().trim().min(40).max(600),
  categorySlug: slugSchema,
  tags: z.array(z.string().trim().min(1).max(32)).min(1).max(12),
  pricing: z.enum(pricingOptions),
  loginRequired: z.boolean().nullable().optional(),
  skillLevel: z.enum(skillLevelOptions).nullable().optional(),
  platforms: z.array(z.enum(toolPlatformOptions)).max(5).default([]),
  outputTypes: z.array(z.enum(toolOutputTypeOptions)).max(6).default([]),
  bestFor: z.array(z.string().trim().min(2).max(80)).max(8).default([]),
  verifiedListing: z.boolean().default(false),
  lastCheckedAt: z.string().datetime().nullable().optional(),
  logo: z.string().url().optional().nullable(),
  screenshots: z.array(z.string().url()).max(8).default([]),
  featured: z.boolean().default(false),
  trendingScore: z.number().min(0).max(100).default(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  status: z.enum(toolStatusOptions).default("approved")
});

export const createToolSchema = toolBaseSchema.extend({
  slug: slugSchema.optional()
});

export const updateToolSchema = toolBaseSchema
  .extend({
    slug: slugSchema.optional()
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const toolListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  category: slugSchema.optional(),
  tag: z.string().trim().min(1).max(32).optional(),
  tags: z.string().trim().max(160).optional(),
  pricing: z.enum(pricingOptions).optional(),
  loginRequired: booleanSearchParamSchema.optional(),
  skillLevel: z.enum(skillLevelOptions).optional(),
  platforms: z.string().trim().max(200).optional(),
  outputTypes: z.string().trim().max(200).optional(),
  sort: z
    .enum(["newest", "popular", "favorited", "featured", "latest"])
    .transform((value) => (value === "latest" ? "newest" : value))
    .default("newest"),
  featured: booleanSearchParamSchema.optional(),
  recent: booleanSearchParamSchema.optional(),
  status: z.enum(toolStatusOptions).optional()
});

export const toolSuggestionQuerySchema = z.object({
  q: z.string().trim().min(2).max(80),
  limit: z.coerce.number().int().min(1).max(10).default(6)
});

export const toolRecommendationQuerySchema = z.object({
  q: z.string().trim().min(3).max(500),
  limit: z.coerce.number().int().min(1).max(5).default(5)
});

export const hybridToolSearchQuerySchema = z.object({
  q: z.string().trim().min(2).max(80),
  category: slugSchema.optional(),
  tag: z.string().trim().min(1).max(32).optional(),
  tags: z.string().trim().max(160).optional(),
  pricing: z.enum(pricingOptions).optional(),
  sort: z
    .enum(["newest", "popular", "favorited", "featured", "latest"])
    .transform((value) => (value === "latest" ? "newest" : value))
    .default("newest"),
  featured: booleanSearchParamSchema.optional(),
  recent: booleanSearchParamSchema.optional(),
  limit: z.coerce.number().int().min(1).max(12).default(8)
});

export const discoveredToolImportSchema = z.object({
  id: z.string().trim().min(2).max(200),
  provider: z.enum(["futurepedia", "theresanaiforthat", "github", "producthunt"]),
  name: z.string().trim().min(2).max(120),
  tagline: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(1200),
  website: z.string().url(),
  category: z.string().trim().min(2).max(80),
  categorySlug: slugSchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  pricing: z.enum(pricingOptions),
  logo: z.string().url().optional().nullable(),
  directoryUrl: z.string().url().optional().nullable()
});
