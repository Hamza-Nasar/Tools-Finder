import { unstable_cache } from "next/cache";
import { isDatabaseUnavailableError } from "@/lib/errors";
import { isDatabaseAvailable } from "@/lib/mongodb";
import { CategoryService } from "@/lib/services/category-service";

const getPublicCategoriesCached = unstable_cache(
  async () => CategoryService.listPublicCategories(),
  ["public-categories"],
  {
    revalidate: 300,
    tags: ["categories", "tools"]
  }
);

const getCategoryBySlugCachedInternal = unstable_cache(
  async (slug: string) => CategoryService.getCategoryBySlug(slug),
  ["category-by-slug"],
  {
    revalidate: 300,
    tags: ["categories", "tools"]
  }
);

export async function getPublicCategories() {
  if (!(await isDatabaseAvailable())) {
    return [];
  }

  try {
    return await getPublicCategoriesCached();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getCategoryBySlugCached(slug: string) {
  return getCategoryBySlugCachedInternal(slug);
}
