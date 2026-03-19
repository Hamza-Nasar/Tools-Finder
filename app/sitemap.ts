import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { getPublicCategories } from "@/lib/data/categories";
import { ToolService } from "@/lib/services/tool-service";
import { seoLandingPages } from "@/lib/seo-landings";
import { isDatabaseUnavailableError } from "@/lib/errors";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/tools",
    "/categories",
    "/submit",
    ...seoLandingPages.map((page) => `/${page.slug}`)
  ].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8
  }));

  try {
    const [categories, tools] = await Promise.all([
      getPublicCategories(),
      ToolService.listTools({
        page: 1,
        limit: 500,
        sort: "newest"
      })
    ]);

    const toolRoutes = tools.data.map((tool) => ({
      url: `${siteConfig.url}/tools/${tool.slug}`,
      lastModified: new Date(tool.createdAt),
      changeFrequency: "weekly" as const,
      priority: tool.featured ? 0.9 : 0.7
    }));

    const categoryRoutes = categories.map((category) => ({
      url: `${siteConfig.url}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7
    }));

    return [...staticRoutes, ...toolRoutes, ...categoryRoutes];
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return staticRoutes;
    }

    throw error;
  }
}
