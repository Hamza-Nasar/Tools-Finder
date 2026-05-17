import type { Tool } from "@/types";

export interface ToolFitBreakdown {
  taskFit: number;
  pricingFit: number;
  integrationFit: number;
  popularityMomentum: number;
}

export interface ToolFitScoreResult {
  score: number;
  breakdown: ToolFitBreakdown;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeToolFitScore(input: {
  tool: Tool;
  query: string;
  inferredCategories: string[];
  inferredTags: string[];
}): ToolFitScoreResult {
  const tool = input.tool;
  const query = input.query.toLowerCase();
  const normalizedTags = tool.tags.map((tag) => tag.toLowerCase());
  const normalizedOutputs = (tool.outputTypes ?? []).map((value) => value.toLowerCase());
  const normalizedPlatforms = (tool.platforms ?? []).map((value) => value.toLowerCase());
  const matchedCategoryCount = input.inferredCategories.includes(tool.categorySlug) ? 1 : 0;
  const matchedTagCount = input.inferredTags.filter((tag) => normalizedTags.includes(tag)).length;
  const queryMentionsPriceSensitivity = ["cheap", "budget", "free", "low cost", "freemium"].some((keyword) =>
    query.includes(keyword)
  );
  const queryMentionsIntegrations = ["integrate", "api", "automation", "workflow", "team"].some((keyword) =>
    query.includes(keyword)
  );

  const taskFit = clampScore(38 + matchedCategoryCount * 34 + matchedTagCount * 9);
  const pricingFit = clampScore(
    tool.pricing === "Free"
      ? queryMentionsPriceSensitivity
        ? 96
        : 88
      : tool.pricing === "Freemium"
        ? queryMentionsPriceSensitivity
          ? 82
          : 78
        : queryMentionsPriceSensitivity
          ? 42
          : 68
  );
  const integrationSignal = Math.min(normalizedTags.length, 7) * 5 + normalizedOutputs.length * 4 + normalizedPlatforms.length * 4;
  const integrationFit = clampScore(queryMentionsIntegrations ? 40 + integrationSignal : 48 + integrationSignal * 0.82);
  const popularityMomentum = clampScore(
    22 + tool.trendingScore * 2.3 + tool.favoritesCount / 18 + tool.viewsCount / 95 + tool.reviewCount / 3.4
  );

  const score = clampScore(taskFit * 0.43 + pricingFit * 0.2 + integrationFit * 0.18 + popularityMomentum * 0.19);

  return {
    score,
    breakdown: {
      taskFit,
      pricingFit,
      integrationFit,
      popularityMomentum
    }
  };
}
