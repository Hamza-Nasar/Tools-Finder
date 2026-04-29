import { unstable_cache } from "next/cache";
import { isDatabaseUnavailableError } from "@/lib/errors";
import { ToolService } from "@/lib/services/tool-service";
import type { SkillLevel, ToolOutputType, ToolPlatform } from "@/types";

const getHomepageToolsCached = unstable_cache(
  async () => {
    const [featured, trending, latest] = await Promise.all([
      ToolService.listFeaturedTools(6),
      ToolService.listTrendingTools(6),
      ToolService.listLatestTools(6)
    ]);

    return { featured, trending, latest };
  },
  ["homepage-tools"],
  {
    revalidate: 120,
    tags: ["tools", "categories"]
  }
);

const getTodayToolsFeedCachedInternal = unstable_cache(
  async () => ToolService.getTodayToolsFeed(6),
  ["today-tools-feed"],
  {
    revalidate: 120,
    tags: ["tools"]
  }
);

const getToolDirectoryFacetsCached = unstable_cache(
  async () => ToolService.getDirectoryFacets(),
  ["tool-directory-facets"],
  {
    revalidate: 900,
    tags: ["tools", "categories"]
  }
);

const getPublicToolListCached = unstable_cache(
  async (query: {
    q?: string;
    category?: string;
    tags?: string[];
    pricing?: "Free" | "Freemium" | "Paid";
    loginRequired?: boolean;
    skillLevel?: SkillLevel;
    platforms?: ToolPlatform[];
    outputTypes?: ToolOutputType[];
    sort?: "newest" | "popular" | "favorited" | "featured";
    featured?: boolean;
    recent?: boolean;
    page: number;
    limit: number;
  }) =>
    ToolService.listTools(query),
  ["public-tool-list"],
  {
    revalidate: 120,
    tags: ["tools", "categories"]
  }
);

const getToolBySlugCachedInternal = unstable_cache(
  async (slug: string) => ToolService.getToolBySlug(slug),
  ["tool-by-slug"],
  {
    revalidate: 120,
    tags: ["tools"]
  }
);

const getRelatedToolsCachedInternal = unstable_cache(
  async (slug: string, categorySlug: string, tagsKey: string, limit: number) =>
    ToolService.listRelatedTools({
      slug,
      categorySlug,
      tags: tagsKey ? tagsKey.split(",") : [],
      limit
    }),
  ["related-tools"],
  {
    revalidate: 120,
    tags: ["tools", "categories"]
  }
);

const getTrendingToolsCachedInternal = unstable_cache(
  async (limit: number) => ToolService.listTrendingTools(limit),
  ["trending-tools"],
  {
    revalidate: 120,
    tags: ["tools"]
  }
);

const getCollectionToolsCachedInternal = unstable_cache(
  async (categoryKey: string, tagsKey: string, pricing: "Free" | "Freemium" | "Paid" | undefined, limit: number) =>
    ToolService.listCollectionTools({
      categorySlugs: categoryKey ? categoryKey.split(",") : [],
      tags: tagsKey ? tagsKey.split(",") : [],
      pricing,
      limit
    }),
  ["collection-tools"],
  {
    revalidate: 300,
    tags: ["tools", "categories"]
  }
);

const getSeoComparisonPairsCachedInternal = unstable_cache(
  async () => ToolService.listSeoComparisonPairs(3),
  ["seo-comparison-pairs"],
  {
    revalidate: 300,
    tags: ["tools", "categories"]
  }
);

export async function getHomepageTools() {
  try {
    return await getHomepageToolsCached();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return { featured: [], trending: [], latest: [] };
    }

    throw error;
  }
}

export async function getTodayToolsFeedCached() {
  try {
    return await getTodayToolsFeedCachedInternal();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        todayNew: [],
        trendingToday: [],
        editorPicks: []
      };
    }

    throw error;
  }
}

export async function getPublicToolList(query: {
  q?: string;
  category?: string;
  tags?: string[];
  pricing?: "Free" | "Freemium" | "Paid";
  loginRequired?: boolean;
  skillLevel?: SkillLevel;
  platforms?: ToolPlatform[];
  outputTypes?: ToolOutputType[];
  sort?: "newest" | "popular" | "favorited" | "featured";
  featured?: boolean;
  recent?: boolean;
  page: number;
  limit: number;
}) {
  try {
    return await getPublicToolListCached(query);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        data: [],
        total: 0,
        page: query.page,
        limit: query.limit,
        totalPages: 1
      };
    }

    throw error;
  }
}

export async function getToolDirectoryFacets() {
  try {
    return await getToolDirectoryFacetsCached();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return { topTags: [] };
    }

    throw error;
  }
}

export async function getToolBySlugCached(slug: string) {
  return getToolBySlugCachedInternal(slug);
}

export async function getRelatedToolsCached(input: {
  slug: string;
  categorySlug: string;
  tags: string[];
  limit?: number;
}) {
  try {
    return await getRelatedToolsCachedInternal(
      input.slug,
      input.categorySlug,
      input.tags.join(","),
      input.limit ?? 6
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getTrendingToolsCached(limit = 6) {
  try {
    return await getTrendingToolsCachedInternal(limit);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getCollectionToolsCached(input: {
  categorySlugs?: string[];
  tags?: string[];
  pricing?: "Free" | "Freemium" | "Paid";
  limit?: number;
}) {
  try {
    return await getCollectionToolsCachedInternal(
      (input.categorySlugs ?? []).join(","),
      (input.tags ?? []).join(","),
      input.pricing,
      input.limit ?? 18
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getSeoComparisonPairsCached() {
  try {
    return await getSeoComparisonPairsCachedInternal();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}
