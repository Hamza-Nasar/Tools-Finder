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

function parseTagList(value: string) {
  const tags = normalizeCsv(value)
    .map((tag) => tag.toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(tags));
}

function parseScreenshotList(value: string) {
  return normalizeCsv(value);
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
  name: z.string().trim().min(2, "Tool name must be at least 2 characters.").max(80, "Tool name cannot exceed 80 characters."),
  tagline: z
    .string()
    .trim()
    .min(10, "Tagline must be at least 10 characters.")
    .max(140, "Tagline cannot exceed 140 characters."),
  website: z.string().trim().url("Enter a valid website URL (for example: https://example.com)."),
  affiliateUrl: z.union([z.string().trim().url("Enter a valid affiliate URL."), z.literal("")]).optional(),
  description: z
    .string()
    .trim()
    .min(40, "Description must be at least 40 characters.")
    .max(600, "Description cannot exceed 600 characters."),
  category: slugSchema.refine((value) => value.length > 0, "Please select a category."),
  tags: z.string().trim().min(2, "Add at least one tag."),
  pricing: z.enum(pricingOptions),
  logo: z.union([z.string().trim().url("Enter a valid logo URL."), z.literal("")]).optional(),
  screenshots: z.string().optional(),
  contactEmail: z.union([z.string().trim().email("Enter a valid contact email."), z.literal("")]).optional(),
  websiteConfirm: z.string().max(0).optional()
}).superRefine((values, context) => {
  const tags = parseTagList(values.tags);

  if (!tags.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Add at least one tag.",
      path: ["tags"]
    });
  } else if (tags.length > 12) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "You can add up to 12 tags.",
      path: ["tags"]
    });
  }

  const screenshots = parseScreenshotList(values.screenshots ?? "");
  if (screenshots.length > 8) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "You can add up to 8 screenshot URLs.",
      path: ["screenshots"]
    });
  }

  const invalidScreenshotIndex = screenshots.findIndex((url) => !z.string().url().safeParse(url).success);
  if (invalidScreenshotIndex >= 0) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Screenshot URL #${invalidScreenshotIndex + 1} is not valid.`,
      path: ["screenshots"]
    });
  }
});

export const submissionFormPayloadSchema = submissionFormSchema.transform((values) => ({
  name: cleanText(values.name),
  tagline: cleanText(values.tagline),
  website: values.website.trim(),
  affiliateUrl: values.affiliateUrl ? values.affiliateUrl : null,
  description: cleanText(values.description),
  categorySlug: values.category,
  tags: parseTagList(values.tags),
  pricing: values.pricing,
  logo: values.logo ? values.logo.trim() : null,
  screenshots: parseScreenshotList(values.screenshots ?? ""),
  contactEmail: values.contactEmail ? values.contactEmail : null
}));

export const submissionListQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().optional(),
  category: slugSchema.optional(),
  status: z.enum(submissionStatusOptions).optional()
});
