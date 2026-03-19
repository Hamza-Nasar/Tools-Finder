import type { Submission } from "@/types";

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
    createdAt: toIsoString(record.createdAt) ?? new Date().toISOString(),
    updatedAt: toIsoString(record.updatedAt)
  };
}
