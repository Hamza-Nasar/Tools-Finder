import { unstable_cache } from "next/cache";
import { isDatabaseUnavailableError } from "@/lib/errors";
import { ToolService } from "@/lib/services/tool-service";

const getHomepageToolsCached = unstable_cache(
  async () => {
    const [featured, trending, latest] = await Promise.all([
      ToolService.listFeaturedTools(6),
      ToolService.listTrendingTools(3),
      ToolService.listLatestTools(3)
    ]);

    return { featured, trending, latest };
  },
  ["homepage-tools"],
  {
    revalidate: 120,
    tags: ["tools", "categories"]
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

const getSimilarToolsCachedInternal = unstable_cache(
  async (categorySlug: string, excludeSlug: string) =>
    ToolService.listSimilarTools(categorySlug, excludeSlug),
  ["similar-tools"],
  {
    revalidate: 120,
    tags: ["tools"]
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

export async function getSimilarToolsCached(categorySlug: string, excludeSlug: string) {
  try {
    return await getSimilarToolsCachedInternal(categorySlug, excludeSlug);
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}
