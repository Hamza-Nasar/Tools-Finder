import type { FinderAssistantInsight, Tool, ToolRecommendation } from "@/types";
import { AIAssistantService } from "@/lib/services/ai-assistant-service";
import { CategoryService } from "@/lib/services/category-service";
import { ToolService } from "@/lib/services/tool-service";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "i",
  "in",
  "is",
  "it",
  "me",
  "need",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with"
]);

const INTENT_HINTS = [
  {
    keywords: ["youtube", "thumbnail", "image", "visual", "poster"],
    categorySlugs: ["design", "image-generation", "video"],
    tags: ["design", "image", "creative", "visual"]
  },
  {
    keywords: ["blog", "writing", "copy", "article", "content", "seo"],
    categorySlugs: ["writing", "marketing"],
    tags: ["writing", "content", "copywriting", "seo"]
  },
  {
    keywords: ["code", "coding", "developer", "programming", "debug", "api"],
    categorySlugs: ["coding"],
    tags: ["code", "developer", "programming", "automation"]
  },
  {
    keywords: ["study", "student", "research", "paper", "notes"],
    categorySlugs: ["research", "productivity"],
    tags: ["research", "study", "notes", "summarizer"]
  },
  {
    keywords: ["video", "editing", "avatar", "clips"],
    categorySlugs: ["video"],
    tags: ["video", "editing", "avatar"]
  },
  {
    keywords: ["audio", "voice", "podcast", "music"],
    categorySlugs: ["audio"],
    tags: ["audio", "voice", "music"]
  },
  {
    keywords: ["marketing", "ads", "campaign", "landing page", "sales"],
    categorySlugs: ["marketing", "writing"],
    tags: ["marketing", "ads", "sales", "copywriting"]
  },
  {
    keywords: ["chatbot", "assistant", "support", "conversation"],
    categorySlugs: ["chatbots", "productivity"],
    tags: ["chatbot", "assistant", "support"]
  }
] as const;

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    .slice(0, 12);
}

function getPricingBoost(
  pricing: Tool["pricing"],
  query: string,
  budgetPreference: FinderAssistantInsight["budgetPreference"] | null
) {
  const wantsBudget = query.includes("free") || query.includes("cheap") || query.includes("budget") || budgetPreference === "free";

  if (wantsBudget) {
    if (pricing === "Free") {
      return 4;
    }

    if (pricing === "Freemium") {
      return 2;
    }

    return 0;
  }

  if (budgetPreference === "freemium") {
    return pricing === "Freemium" ? 3 : pricing === "Free" ? 2 : 0;
  }

  if (budgetPreference === "paid") {
    return pricing === "Paid" ? 2 : 0;
  }

  return 0;
}

function scoreTool(
  tool: Tool,
  query: string,
  tokens: string[],
  inferredCategories: string[],
  inferredTags: string[],
  budgetPreference: FinderAssistantInsight["budgetPreference"] | null
) {
  const lowerQuery = query.toLowerCase();
  const haystack = [tool.name, tool.tagline, tool.description, tool.category, ...tool.tags].join(" ").toLowerCase();
  const lowerToolTags = tool.tags.map((value) => value.toLowerCase());
  const matchedCategories = inferredCategories.filter((slug) => slug === tool.categorySlug);
  const matchedTags = inferredTags.filter((tag) => lowerToolTags.includes(tag));
  const phraseBoost = haystack.includes(lowerQuery) ? 12 : 0;
  const tokenBoost = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1.8 : 0), 0);
  const categoryBoost = matchedCategories.length * 6;
  const tagBoost = matchedTags.length * 4;
  const pricingBoost = getPricingBoost(tool.pricing, lowerQuery, budgetPreference);
  const popularityBoost =
    tool.trendingScore / 20 +
    tool.favoritesCount / 250 +
    tool.viewsCount / 500 +
    tool.reviewCount / 100;

  const score = phraseBoost + tokenBoost + categoryBoost + tagBoost + pricingBoost + popularityBoost;
  const reasonParts: string[] = [];

  if (matchedCategories.length) {
    reasonParts.push(`matches ${tool.category.toLowerCase()}`);
  }

  if (matchedTags.length) {
    reasonParts.push(`covers ${matchedTags.slice(0, 2).join(" and ")}`);
  }

  if (!reasonParts.length && tool.tagline) {
    reasonParts.push(tool.tagline);
  }

  return {
    score,
    matchedCategories,
    matchedTags,
    reason: reasonParts.join("; ")
  };
}

export class RecommendationService {
  static async recommendTools(problem: string, limit = 6): Promise<{
    query: string;
    inferredCategories: string[];
    inferredTags: string[];
    aiInsight: FinderAssistantInsight | null;
    tools: ToolRecommendation[];
  }> {
    const query = problem.trim();

    if (query.length < 3) {
      return {
        query,
        inferredCategories: [],
        inferredTags: [],
        aiInsight: null,
        tools: []
      };
    }

    const tokens = tokenize(query);
    const categories = await CategoryService.listPublicCategories();
    const aiInsight = AIAssistantService.isEnabled()
      ? await AIAssistantService.enhanceFinderQuery({
          query,
          categories
        })
      : null;
    const inferredCategorySet = new Set<string>();
    const inferredTagSet = new Set<string>();

    for (const category of categories) {
      const categoryHaystack = `${category.name} ${category.slug} ${category.description}`.toLowerCase();

      if (tokens.some((token) => categoryHaystack.includes(token))) {
        inferredCategorySet.add(category.slug);
      }
    }

    for (const hint of INTENT_HINTS) {
      if (hint.keywords.some((keyword) => query.toLowerCase().includes(keyword))) {
        hint.categorySlugs.forEach((slug) => inferredCategorySet.add(slug));
        hint.tags.forEach((tag) => inferredTagSet.add(tag));
      }
    }

    aiInsight?.inferredCategories.forEach((slug) => inferredCategorySet.add(slug));
    aiInsight?.inferredTags.forEach((tag) => inferredTagSet.add(tag));

    const inferredCategories = Array.from(inferredCategorySet).slice(0, 4);
    const inferredTags = Array.from(inferredTagSet).slice(0, 6);
    const querySets = await Promise.all([
      ToolService.listTools({
        q: query,
        page: 1,
        limit: 18,
        sort: "popular"
      }),
      ...inferredCategories.slice(0, 2).map((slug) =>
        ToolService.listTools({
          category: slug,
          page: 1,
          limit: 12,
          sort: "popular"
        })
      ),
      inferredTags.length
        ? ToolService.listTools({
            tags: inferredTags.slice(0, 3),
            page: 1,
            limit: 12,
            sort: "popular"
          })
        : Promise.resolve({ data: [], total: 0, page: 1, limit: 12, totalPages: 1 })
    ]);

    const candidateMap = new Map<string, Tool>();

    for (const result of querySets) {
      for (const tool of result.data) {
        candidateMap.set(tool.id, tool);
      }
    }

    if (!candidateMap.size) {
      const fallback = await ToolService.listTools({
        page: 1,
        limit: 12,
        sort: "popular"
      });

      for (const tool of fallback.data) {
        candidateMap.set(tool.id, tool);
      }
    }

    const ranked = Array.from(candidateMap.values())
      .map((tool) => {
        const scored = scoreTool(
          tool,
          query,
          tokens,
          inferredCategories,
          inferredTags,
          aiInsight?.budgetPreference ?? null
        );

        return {
          tool,
          score: scored.score,
          reason: scored.reason,
          matchedCategories: scored.matchedCategories,
          matchedTags: scored.matchedTags
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    return {
      query,
      inferredCategories,
      inferredTags,
      aiInsight,
      tools: ranked
    };
  }
}
