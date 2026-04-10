import { z } from "zod";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}, z.string().min(1).optional());

const optionalWebsiteString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}, z.string().min(1).max(240).optional());

const toolComparisonSnapshotSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(600),
  category: z.string().trim().min(1).max(80),
  categorySlug: z.string().trim().min(1).max(80),
  tags: z.array(z.string().trim().min(1).max(32)).max(12),
  pricing: z.enum(["Free", "Freemium", "Paid"]),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  favoritesCount: z.number().min(0),
  viewsCount: z.number().min(0),
  trendingScore: z.number().min(0)
});

export const submissionDraftRequestSchema = z
  .object({
    name: optionalTrimmedString,
    website: optionalWebsiteString,
    tagline: optionalTrimmedString,
    description: optionalTrimmedString
  })
  .refine(
    (value) => Boolean(value.name || value.website || value.tagline || value.description),
    "Provide at least a tool name, website, tagline, or description."
  );

export const comparisonInsightRequestSchema = z.object({
  toolA: toolComparisonSnapshotSchema,
  toolB: toolComparisonSnapshotSchema
});
