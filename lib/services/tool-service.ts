import mongoose from "mongoose";
import type { PricingTier, ToolDirectoryFacets, ToolSort, ToolSuggestion } from "@/types";
import { slugify } from "@/utils/slugify";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { toObjectId } from "@/lib/object-id";
import { serializeTool } from "@/lib/serializers/tool";
import { sanitizeOptionalUrl, sanitizeTagList, sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { extractWebsiteDomain } from "@/lib/url";
import { FavoriteModel } from "@/models/Favorite";
import { ReviewModel } from "@/models/Review";
import { ToolActivityModel } from "@/models/ToolActivity";
import { ToolModel } from "@/models/Tool";
import { CategoryService } from "@/lib/services/category-service";
import { ToolActivityService } from "@/lib/services/tool-activity-service";
import { FeaturedListingService, getActiveFeaturedFilter } from "@/lib/services/featured-listing-service";

const { Types } = mongoose;
type ObjectId = mongoose.Types.ObjectId;

interface ListToolsOptions {
  q?: string;
  category?: string;
  tags?: string[];
  pricing?: PricingTier;
  sort?: ToolSort;
  featured?: boolean;
  recent?: boolean;
  status?: "draft" | "pending" | "approved" | "rejected";
  page: number;
  limit: number;
  includeNonApproved?: boolean;
}

interface ToolWriteInput {
  slug?: string;
  name: string;
  tagline: string;
  website: string;
  affiliateUrl?: string | null;
  description: string;
  categorySlug: string;
  tags: string[];
  pricing: "Free" | "Freemium" | "Paid";
  logo?: string | null;
  screenshots?: string[];
  featured?: boolean;
  trendingScore?: number;
  rating?: number;
  reviewCount?: number;
  status?: "draft" | "pending" | "approved" | "rejected";
  createdBy?: string | null;
  sourceSubmission?: string | null;
}

const NEW_TOOL_WINDOW_DAYS = 30;
const TOOL_LIST_PROJECTION = {
  name: 1,
  slug: 1,
  tagline: 1,
  description: 1,
  website: 1,
  category: 1,
  categoryName: 1,
  categorySlug: 1,
  tags: 1,
  pricing: 1,
  featured: 1,
  affiliateUrl: 1,
  featuredUntil: 1,
  featureSource: 1,
  status: 1,
  logo: 1,
  createdAt: 1,
  updatedAt: 1,
  trendingScore: 1,
  rating: 1,
  reviewCount: 1,
  favoritesCount: 1,
  viewsCount: 1,
  clicksCount: 1,
  latestFavoriteAt: 1,
  latestViewAt: 1,
  latestClickAt: 1,
  createdBy: 1
} as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTags(tags: string[] | undefined) {
  return (tags ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function getRecentCutoffDate(days = NEW_TOOL_WINDOW_DAYS) {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff;
}

function buildSort(sort: ToolSort, hasTextSearch: boolean) {
  const sortMap: Record<ToolSort, Record<string, 1 | -1>> = {
    newest: { createdAt: -1, featured: -1 },
    popular: { trendingScore: -1, favoritesCount: -1, viewsCount: -1, reviewCount: -1, createdAt: -1 },
    favorited: { favoritesCount: -1, latestFavoriteAt: -1, createdAt: -1 },
    featured: { featured: -1, trendingScore: -1, favoritesCount: -1, createdAt: -1 }
  };

  if (!hasTextSearch) {
    return sortMap[sort];
  }

  return {
    score: { $meta: "textScore" as const },
    ...sortMap[sort]
  };
}

async function resolveUniqueToolSlug(baseValue: string, excludeId?: ObjectId) {
  const baseSlug = slugify(baseValue);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await ToolModel.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    })
      .select({ _id: 1 })
      .lean();

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

function buildSuggestion(record: Record<string, unknown> & { _id: unknown }): ToolSuggestion {
  const toObjectIdString = (value: unknown) => {
    if (typeof value === "string") {
      return value;
    }

    if (value && typeof value === "object" && "toString" in value) {
      return value.toString();
    }

    return "";
  };

  return {
    id: toObjectIdString(record._id),
    slug: String(record.slug),
    name: String(record.name),
    category: String(record.categoryName),
    categorySlug: String(record.categorySlug),
    pricing: record.pricing as ToolSuggestion["pricing"],
    featured: Boolean(record.featured)
  };
}

async function findDuplicateTool(options: {
  slug?: string;
  websiteDomain?: string | null;
  excludeId?: ObjectId;
}) {
  const predicates: Record<string, unknown>[] = [];

  if (options.slug) {
    predicates.push({ slug: options.slug });
  }

  if (options.websiteDomain) {
    predicates.push({ websiteDomain: options.websiteDomain });
  }

  if (!predicates.length) {
    return null;
  }

  return ToolModel.findOne({
    ...(options.excludeId ? { _id: { $ne: options.excludeId } } : {}),
    status: { $ne: "rejected" },
    $or: predicates
  })
    .select({ _id: 1, name: 1, slug: 1, websiteDomain: 1 })
    .lean<{ _id: ObjectId; name: string; slug: string; websiteDomain?: string | null } | null>();
}

function assertNoDuplicateTool(record: Awaited<ReturnType<typeof findDuplicateTool>>) {
  if (!record) {
    return;
  }

  throw new AppError(
    409,
    `A tool already exists for ${record.name}.`,
    "TOOL_DUPLICATE",
    {
      slug: record.slug,
      websiteDomain: record.websiteDomain ?? null
    }
  );
}

export class ToolService {
  static async listTools(options: ListToolsOptions) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = {};
    const normalizedTags = normalizeTags(options.tags);
    const trimmedQuery = options.q?.trim();
    const hasTextSearch = Boolean(trimmedQuery && trimmedQuery.length >= 2);
    const hasRegexSearch = Boolean(trimmedQuery && trimmedQuery.length < 2);

    if (!options.includeNonApproved) {
      filter.status = "approved";
    } else if (options.status) {
      filter.status = options.status;
    }

    if (options.category) {
      filter.categorySlug = options.category;
    }

    if (normalizedTags.length) {
      filter.tags = { $all: normalizedTags };
    }

    if (options.pricing) {
      filter.pricing = options.pricing;
    }

    if (options.featured !== undefined) {
      if (options.featured) {
        Object.assign(filter, getActiveFeaturedFilter());
      } else {
        filter.featured = false;
      }
    }

    if (options.recent) {
      filter.createdAt = { $gte: getRecentCutoffDate() };
    }

    if (hasTextSearch && trimmedQuery) {
      filter.$text = { $search: trimmedQuery };
    } else if (hasRegexSearch && trimmedQuery) {
      const pattern = new RegExp(escapeRegExp(trimmedQuery), "i");
      filter.$or = [
        { name: pattern },
        { tagline: pattern },
        { description: pattern },
        { tags: pattern },
        { categoryName: pattern }
      ];
    }

    const projection = hasTextSearch
      ? {
          ...TOOL_LIST_PROJECTION,
          score: { $meta: "textScore" as const }
        }
      : TOOL_LIST_PROJECTION;
    const sort = buildSort(options.sort ?? "newest", hasTextSearch);

    const [records, total] = await Promise.all([
      ToolModel.find(filter, projection).sort(sort).skip(skip).limit(options.limit).lean(),
      ToolModel.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => serializeTool(record)),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async getDirectoryFacets(limit = 12): Promise<ToolDirectoryFacets> {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const topTags = await ToolModel.aggregate<{ tag: string; count: number }>([
      { $match: { status: "approved" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit },
      { $project: { _id: 0, tag: "$_id", count: 1 } }
    ]);

    return {
      topTags
    };
  }

  static async listSearchSuggestions(query: string, limit = 6) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return [];
    }

    const pattern = new RegExp(`^${escapeRegExp(trimmedQuery)}`, "i");
    const projection = {
      name: 1,
      slug: 1,
      categoryName: 1,
      categorySlug: 1,
      pricing: 1,
      featured: 1
    } as const;

    const prefixMatches = await ToolModel.find(
      {
        status: "approved",
        $or: [{ name: pattern }, { categoryName: pattern }, { tags: pattern }]
      },
      projection
    )
      .sort({ featured: -1, favoritesCount: -1, trendingScore: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const seenSlugs = new Set(prefixMatches.map((tool) => String(tool.slug)));

    if (prefixMatches.length < limit) {
      const textMatches = await ToolModel.find(
        {
          status: "approved",
          $text: { $search: trimmedQuery },
          slug: { $nin: Array.from(seenSlugs) }
        },
        {
          ...projection,
          score: { $meta: "textScore" as const }
        }
      )
        .sort({ score: { $meta: "textScore" }, featured: -1, favoritesCount: -1, createdAt: -1 })
        .limit(limit - prefixMatches.length)
        .lean();

      prefixMatches.push(...textMatches);
    }

    return prefixMatches.map((record) => buildSuggestion(record));
  }

  static async getToolBySlug(slug: string, includeNonApproved = false) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const record = await ToolModel.findOne({
      slug,
      ...(includeNonApproved ? {} : { status: "approved" })
    }).lean();

    if (!record || Array.isArray(record)) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    return serializeTool(record);
  }

  static async listFeaturedTools(limit = 6) {
    const result = await this.listTools({
      page: 1,
      limit,
      featured: true,
      sort: "featured"
    });

    return result.data;
  }

  static async listTrendingTools(limit = 6) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const activity = await ToolActivityService.listTrendingToolIds(limit);
    const toolIds = activity.map((entry) => entry.toolId);
    const tools = toolIds.length
      ? await ToolModel.find(
          {
            _id: { $in: toolIds },
            status: "approved"
          },
          TOOL_LIST_PROJECTION
        ).lean()
      : [];
    const toolsById = new Map(tools.map((tool) => [String(tool._id), serializeTool(tool)]));

    const ranked = activity
      .map((entry) => {
        const tool = toolsById.get(entry.toolId.toString());

        if (!tool) {
          return null;
        }

        const score =
          entry.activityScore +
          ToolActivityService.getRecencyBoost(tool.createdAt) +
          (tool.featured ? 4 : 0);

        return { tool, score };
      })
      .filter((entry): entry is { tool: ReturnType<typeof serializeTool>; score: number } => Boolean(entry))
      .sort((left, right) => right.score - left.score);

    const results = ranked.slice(0, limit).map((entry) => entry.tool);

    if (results.length >= limit) {
      return results;
    }

    const fallbackTools = await ToolModel.find(
      {
        status: "approved",
        _id: { $nin: results.map((tool) => new Types.ObjectId(tool.id)) }
      },
      TOOL_LIST_PROJECTION
    )
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit - results.length)
      .lean();

    return [...results, ...fallbackTools.map((record) => serializeTool(record))];
  }

  static async listLatestTools(limit = 6) {
    const result = await this.listTools({
      page: 1,
      limit,
      sort: "newest"
    });

    return result.data;
  }

  static async listSimilarTools(categorySlug: string, excludeSlug: string, limit = 3) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const records = await ToolModel.find(
      {
        categorySlug,
        slug: { $ne: excludeSlug },
        status: "approved"
      },
      TOOL_LIST_PROJECTION
    )
      .sort({ trendingScore: -1, favoritesCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return records.map((record) => serializeTool(record));
  }

  static async recordViewBySlug(slug: string) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const tool = await ToolModel.findOne({
      slug,
      status: "approved"
    })
      .select({ _id: 1 })
      .lean();

    if (!tool || Array.isArray(tool)) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    await ToolActivityService.recordView(tool._id as ObjectId);
  }

  static async recordClickBySlug(slug: string) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const tool = await ToolModel.findOne({
      slug,
      status: "approved"
    })
      .select({ _id: 1 })
      .lean();

    if (!tool || Array.isArray(tool)) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    await ToolActivityService.recordClick(tool._id as ObjectId);
  }

  static async createTool(input: ToolWriteInput) {
    await connectToDatabase();

    const category = await CategoryService.getCategoryBySlug(input.categorySlug);
    const sanitizedName = sanitizeText(input.name);
    const sanitizedWebsite = sanitizeUrl(input.website);
    const websiteDomain = extractWebsiteDomain(sanitizedWebsite);
    const requestedSlug = slugify(input.slug ?? sanitizedName);
    assertNoDuplicateTool(
      await findDuplicateTool({
        slug: requestedSlug,
        websiteDomain
      })
    );
    const slug = await resolveUniqueToolSlug(requestedSlug);
    const createdAt = new Date();

    const tool = await ToolModel.create({
      slug,
      name: sanitizedName,
      tagline: sanitizeText(input.tagline),
      website: sanitizedWebsite,
      websiteDomain,
      affiliateUrl: sanitizeOptionalUrl(input.affiliateUrl ?? null),
      description: sanitizeText(input.description),
      category: new Types.ObjectId(category.id),
      categoryName: category.name,
      categorySlug: category.slug,
      tags: sanitizeTagList(input.tags),
      pricing: input.pricing,
      logo: sanitizeOptionalUrl(input.logo ?? null),
      screenshots: (input.screenshots ?? []).map((shot) => sanitizeUrl(shot)),
      featured: input.featured ?? false,
      featureSource: input.featured ? "manual" : null,
      featuredUntil: null,
      trendingScore: input.trendingScore ?? ToolActivityService.getRecencyBoost(createdAt),
      rating: input.rating ?? 0,
      reviewCount: input.reviewCount ?? 0,
      favoritesCount: 0,
      viewsCount: 0,
      clicksCount: 0,
      status: input.status ?? "approved",
      createdBy: input.createdBy ? toObjectId(input.createdBy, "createdBy") : undefined,
      sourceSubmission: input.sourceSubmission ? toObjectId(input.sourceSubmission, "sourceSubmission") : null
    });

    return serializeTool(tool.toObject());
  }

  static async updateToolBySlug(slug: string, input: Partial<ToolWriteInput>) {
    await connectToDatabase();

    const tool = await ToolModel.findOne({ slug });

    if (!tool) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    const nextName = input.name !== undefined ? sanitizeText(input.name) : tool.name;
    const nextWebsite = input.website !== undefined ? sanitizeUrl(input.website) : tool.website;
    const nextRequestedSlug =
      input.slug !== undefined ? slugify(input.slug) : input.name !== undefined ? slugify(nextName) : tool.slug;
    const nextWebsiteDomain = extractWebsiteDomain(nextWebsite);

    assertNoDuplicateTool(
      await findDuplicateTool({
        slug: nextRequestedSlug,
        websiteDomain: nextWebsiteDomain,
        excludeId: tool._id
      })
    );

    if (input.categorySlug) {
      const category = await CategoryService.getCategoryBySlug(input.categorySlug);
      tool.category = toObjectId(category.id, "category");
      tool.categoryName = category.name;
      tool.categorySlug = category.slug;
    }

    if (input.slug || input.name) {
      tool.slug = await resolveUniqueToolSlug(nextRequestedSlug, tool._id);
    }

    if (input.name !== undefined) tool.name = nextName;
    if (input.tagline !== undefined) tool.tagline = sanitizeText(input.tagline);
    if (input.website !== undefined) {
      tool.website = nextWebsite;
      tool.websiteDomain = nextWebsiteDomain;
    }
    if (input.affiliateUrl !== undefined) tool.affiliateUrl = sanitizeOptionalUrl(input.affiliateUrl ?? null);
    if (input.description !== undefined) tool.description = sanitizeText(input.description);
    if (input.tags !== undefined) tool.tags = sanitizeTagList(input.tags);
    if (input.pricing !== undefined) tool.pricing = input.pricing;
    if (input.logo !== undefined) tool.logo = sanitizeOptionalUrl(input.logo ?? null);
    if (input.screenshots !== undefined) tool.screenshots = input.screenshots.map((shot) => sanitizeUrl(shot));
    if (input.featured !== undefined) {
      tool.featured = input.featured;
      tool.featureSource = input.featured ? "manual" : null;
      tool.featuredUntil = null;
    }
    if (input.trendingScore !== undefined) tool.trendingScore = input.trendingScore;
    if (input.rating !== undefined) tool.rating = input.rating;
    if (input.reviewCount !== undefined) tool.reviewCount = input.reviewCount;
    if (input.status !== undefined) tool.status = input.status;

    await tool.save();

    return serializeTool(tool.toObject());
  }

  static async deleteToolBySlug(slug: string) {
    await connectToDatabase();

    const tool = await ToolModel.findOne({ slug });

    if (!tool) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    await Promise.all([
      FavoriteModel.deleteMany({ toolId: tool._id }),
      ReviewModel.deleteMany({ toolId: tool._id }),
      ToolActivityModel.deleteMany({ toolId: tool._id }),
      tool.deleteOne()
    ]);
  }
}
