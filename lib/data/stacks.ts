import { unstable_cache } from "next/cache";
import type { FeaturedStackPreset, Tool } from "@/types";
import { isDatabaseUnavailableError } from "@/lib/errors";
import { featuredStackPresets } from "@/lib/stack-presets";
import { ToolService } from "@/lib/services/tool-service";

export interface FeaturedStackPreview extends FeaturedStackPreset {
  tools: Tool[];
}

const getFeaturedStackPreviewsCachedInternal = unstable_cache(
  async (): Promise<FeaturedStackPreview[]> => {
    const allSlugs = Array.from(new Set(featuredStackPresets.flatMap((preset) => preset.toolSlugs)));
    const tools = await ToolService.listToolsBySlugs(allSlugs);
    const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

    return featuredStackPresets.map((preset) => ({
      ...preset,
      tools: preset.toolSlugs.map((slug) => toolsBySlug.get(slug)).filter((tool): tool is Tool => Boolean(tool))
    }));
  },
  ["featured-stack-previews"],
  {
    revalidate: 300,
    tags: ["tools"]
  }
);

export async function getFeaturedStackPreviews() {
  try {
    return await getFeaturedStackPreviewsCachedInternal();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return featuredStackPresets.map((preset) => ({
        ...preset,
        tools: []
      }));
    }

    throw error;
  }
}
