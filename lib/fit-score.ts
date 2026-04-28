import type { Tool } from "@/types";

export interface ToolFitBreakdown {
  taskFit: number;
  setupFriction: number;
  stackCompatibility: number;
  marketMomentum: number;
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
  const matchedCategoryCount = input.inferredCategories.includes(tool.categorySlug) ? 1 : 0;
  const matchedTagCount = input.inferredTags.filter((tag) => normalizedTags.includes(tag)).length;
  const queryMentionsPriceSensitivity = ["cheap", "budget", "free"].some((keyword) => query.includes(keyword));

  const taskFit = clampScore(40 + matchedCategoryCount * 35 + matchedTagCount * 8);
  const setupFriction = clampScore(
    tool.pricing === "Free" ? 92 : tool.pricing === "Freemium" ? 76 : queryMentionsPriceSensitivity ? 48 : 64
  );
  const stackCompatibility = clampScore(52 + Math.min(normalizedTags.length, 8) * 5);
  const marketMomentum = clampScore(
    20 + tool.trendingScore * 2.2 + tool.favoritesCount / 20 + tool.viewsCount / 100 + tool.reviewCount / 4
  );

  const score = clampScore(taskFit * 0.42 + setupFriction * 0.2 + stackCompatibility * 0.18 + marketMomentum * 0.2);

  return {
    score,
    breakdown: {
      taskFit,
      setupFriction,
      stackCompatibility,
      marketMomentum
    }
  };
}
