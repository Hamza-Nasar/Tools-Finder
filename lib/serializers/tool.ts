import { categoryGradientMap } from "@/lib/constants";
import type { Tool } from "@/types";

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

  return new Date().toISOString();
}

export function serializeTool(record: SerializableRecord): Tool {
  const name = String(record.name);
  const initials = name
    .split(" ")
    .map((chunk) => chunk[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const categorySlug = String(record.categorySlug);
  const featuredUntil =
    record.featuredUntil instanceof Date || typeof record.featuredUntil === "string"
      ? new Date(record.featuredUntil)
      : null;
  const isActiveFeatured =
    Boolean(record.featured) &&
    (!featuredUntil || Number.isNaN(featuredUntil.getTime()) || featuredUntil.getTime() >= Date.now());

  return {
    id: toObjectIdString(record._id),
    slug: String(record.slug),
    name,
    tagline: String(record.tagline),
    description: String(record.description),
    website: String(record.website),
    affiliateUrl: record.affiliateUrl ? String(record.affiliateUrl) : null,
    launchYear: typeof record.launchYear === "number" ? record.launchYear : null,
    categoryId: toObjectIdString(record.category),
    category: String(record.categoryName),
    categorySlug,
    tags: toStringArray(record.tags),
    pricing: record.pricing as Tool["pricing"],
    loginRequired:
      typeof record.loginRequired === "boolean"
        ? record.loginRequired
        : record.loginRequired === null
          ? null
          : null,
    skillLevel: (record.skillLevel as Tool["skillLevel"] | undefined) ?? null,
    platforms: Array.isArray(record.platforms)
      ? record.platforms.map((item) => String(item)) as NonNullable<Tool["platforms"]>
      : [],
    outputTypes: Array.isArray(record.outputTypes)
      ? record.outputTypes.map((item) => String(item)) as NonNullable<Tool["outputTypes"]>
      : [],
    bestFor: Array.isArray(record.bestFor) ? record.bestFor.map((item) => String(item)) : [],
    verifiedListing: Boolean(record.verifiedListing),
    lastCheckedAt: record.lastCheckedAt ? toIsoString(record.lastCheckedAt) : null,
    featured: isActiveFeatured,
    status: record.status as Tool["status"],
    logo: record.logo ? String(record.logo) : null,
    logoText: initials || "AI",
    logoBackground: categoryGradientMap[categorySlug] ?? "from-cyan-600 to-teal-500",
    screenshots: toStringArray(record.screenshots),
    createdAt: toIsoString(record.createdAt),
    updatedAt: record.updatedAt ? toIsoString(record.updatedAt) : undefined,
    trendingScore: Number(record.trendingScore ?? 0),
    rating: Number(record.rating ?? 0),
    reviewCount: Number(record.reviewCount ?? 0),
    favoritesCount: Number(record.favoritesCount ?? 0),
    viewsCount: Number(record.viewsCount ?? 0),
    clicksCount: Number(record.clicksCount ?? 0),
    comparisonClicksCount: Number(record.comparisonClicksCount ?? 0),
    latestFavoriteAt: record.latestFavoriteAt ? toIsoString(record.latestFavoriteAt) : null,
    latestViewAt: record.latestViewAt ? toIsoString(record.latestViewAt) : null,
    latestClickAt: record.latestClickAt ? toIsoString(record.latestClickAt) : null,
    featuredUntil: featuredUntil ? featuredUntil.toISOString() : null,
    featureSource: (record.featureSource as Tool["featureSource"] | undefined) ?? null,
    createdBy: record.createdBy ? toObjectIdString(record.createdBy) : null
  };
}
