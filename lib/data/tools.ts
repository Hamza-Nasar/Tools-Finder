import { unstable_cache } from "next/cache";
import { isDatabaseUnavailableError } from "@/lib/errors";
import { isDatabaseAvailable } from "@/lib/mongodb";
import { ToolService } from "@/lib/services/tool-service";

const emptyHomepageTools = {
  featured: [],
  trending: [],
  latest: []
};

const emptyTodayToolsFeed = {
  todayNew: [],
  trendingToday: [],
  editorPicks: []
};

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
  if (!(await isDatabaseAvailable())) {
    return emptyHomepageTools;
  }

  try {
    return await getHomepageToolsCached();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return emptyHomepageTools;
    }

    throw error;
  }
}

export async function getTodayToolsFeedCached() {
  if (!(await isDatabaseAvailable())) {
    return emptyTodayToolsFeed;
  }

  try {
    return await getTodayToolsFeedCachedInternal();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return emptyTodayToolsFeed;
    }

    throw error;
  }
}

export async function getPublicToolList(query: {
  q?: string;
  category?: string;
  tags?: string[];
  pricing?: "Free" | "Freemium" | "Paid";
  sort?: "newest" | "popular" | "favorited" | "featured";
  featured?: boolean;
  recent?: boolean;
  page: number;
  limit: number;
}) {
  if (!(await isDatabaseAvailable())) {
    return {
      data: [],
      total: 0,
      page: query.page,
      limit: query.limit,
      totalPages: 1
    };
  }

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
  if (!(await isDatabaseAvailable())) {
    return { topTags: [] };
  }

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
  if (!(await isDatabaseAvailable())) {
    return [];
  }

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
  if (!(await isDatabaseAvailable())) {
    return [];
  }

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
  if (!(await isDatabaseAvailable())) {
    return [];
  }

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
  if (!(await isDatabaseAvailable())) {
    return [];
  }

  try {
    return await getSeoComparisonPairsCachedInternal();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}
