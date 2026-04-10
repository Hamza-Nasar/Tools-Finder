import type { Submission, SubmissionAIReview } from "@/types";

type SerializableRecord = Record<string, unknown> & {
  _id: unknown;
};

function toObjectIdString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "toString" in value) {
    return value.toString();
  }

  return "";
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function toIsoString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return undefined;
}

export function serializeSubmission(record: SerializableRecord): Submission {
  return {
    id: toObjectIdString(record._id),
    slug: String(record.slug),
    name: String(record.name),
    tagline: String(record.tagline),
    website: String(record.website),
    affiliateUrl: record.affiliateUrl ? String(record.affiliateUrl) : null,
    launchYear: typeof record.launchYear === "number" ? record.launchYear : null,
    description: String(record.description),
    categoryId: toObjectIdString(record.category),
    category: String(record.categoryName),
    categorySlug: String(record.categorySlug),
    tags: toStringArray(record.tags),
    pricing: record.pricing as Submission["pricing"],
    logo: record.logo ? String(record.logo) : null,
    screenshots: toStringArray(record.screenshots),
    status: record.status as Submission["status"],
    moderationNote: record.moderationNote ? String(record.moderationNote) : null,
    contactEmail: record.contactEmail ? String(record.contactEmail) : null,
    approvedToolId: record.approvedTool ? toObjectIdString(record.approvedTool) : null,
    aiReview:
      record.aiReview && typeof record.aiReview === "object"
        ? {
            summary:
              "summary" in record.aiReview && record.aiReview.summary
                ? String(record.aiReview.summary)
                : "",
            qualityScore:
              "qualityScore" in record.aiReview && typeof record.aiReview.qualityScore === "number"
                ? record.aiReview.qualityScore
                : null,
            confidence:
              "confidence" in record.aiReview && typeof record.aiReview.confidence === "number"
                ? record.aiReview.confidence
                : null,
            suggestedCategorySlug:
              "suggestedCategorySlug" in record.aiReview && record.aiReview.suggestedCategorySlug
                ? String(record.aiReview.suggestedCategorySlug)
                : null,
            suggestedTags:
              "suggestedTags" in record.aiReview ? toStringArray(record.aiReview.suggestedTags) : [],
            recommendedAction:
              "recommendedAction" in record.aiReview && record.aiReview.recommendedAction
                ? (String(record.aiReview.recommendedAction) as SubmissionAIReview["recommendedAction"])
                : null,
            riskFlags: "riskFlags" in record.aiReview ? toStringArray(record.aiReview.riskFlags) : [],
            isLikelyAiTool:
              "isLikelyAiTool" in record.aiReview && typeof record.aiReview.isLikelyAiTool === "boolean"
                ? record.aiReview.isLikelyAiTool
                : null,
            analyzedAt:
              "analyzedAt" in record.aiReview ? toIsoString(record.aiReview.analyzedAt) ?? null : null
          }
        : null,
    createdAt: toIsoString(record.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoString(record.updatedAt)
  };
}
