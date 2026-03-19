import { z } from "zod";
import { pricingOptions, submissionStatusOptions } from "@/lib/constants";
import { paginationQuerySchema, slugSchema } from "@/lib/validators/common";

function cleanText(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

function normalizeCsv(value: string) {
  return value
    .split(",")
    .map((item) => cleanText(item))
    .filter(Boolean);
}

export const submissionBaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(140),
  website: z.string().url("Provide a valid website URL."),
  affiliateUrl: z.string().url("Provide a valid affiliate URL.").optional().nullable(),
  description: z.string().trim().min(40).max(600),
  categorySlug: slugSchema,
  tags: z.array(z.string().trim().min(1).max(32)).min(1).max(12),
  pricing: z.enum(pricingOptions),
  logo: z.string().url().optional().nullable(),
  screenshots: z.array(z.string().url()).max(8).default([]),
  contactEmail: z.string().email().optional().nullable()
});

export const createSubmissionSchema = submissionBaseSchema;

export const updateSubmissionSchema = submissionBaseSchema
  .extend({
    status: z.enum(submissionStatusOptions).optional(),
    moderationNote: z.string().trim().max(400).optional().nullable()
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const submissionFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(140),
  website: z.string().url("Provide a valid website URL."),
  affiliateUrl: z.union([z.string().url("Provide a valid affiliate URL."), z.literal("")]).optional(),
  description: z.string().trim().min(40).max(600),
  category: slugSchema,
  tags: z.string().trim().min(2),
  pricing: z.enum(pricingOptions),
  logo: z.union([z.string().url("Provide a valid logo URL."), z.literal("")]).optional(),
  screenshots: z.string().optional(),
  contactEmail: z.union([z.string().email("Provide a valid contact email."), z.literal("")]).optional(),
  websiteConfirm: z.string().max(0).optional()
});

export const submissionFormPayloadSchema = submissionFormSchema.transform((values) => ({
  name: cleanText(values.name),
  tagline: cleanText(values.tagline),
  website: values.website,
  affiliateUrl: values.affiliateUrl ? values.affiliateUrl : null,
  description: cleanText(values.description),
  categorySlug: values.category,
  tags: normalizeCsv(values.tags),
  pricing: values.pricing,
  logo: values.logo ? values.logo : null,
  screenshots: normalizeCsv(values.screenshots ?? ""),
  contactEmail: values.contactEmail ? values.contactEmail : null
}));

export const submissionListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  category: slugSchema.optional(),
  status: z.enum(submissionStatusOptions).optional()
});
