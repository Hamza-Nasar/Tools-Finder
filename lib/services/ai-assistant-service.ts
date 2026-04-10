import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import type { Category, ComparisonAssistantInsight, FinderAssistantInsight, SubmissionAIReview, Tool } from "@/types";
import { getOpenAIClient, getOpenAIModel, hasOpenAIConfig } from "@/lib/openai";
import { sanitizeTagList, sanitizeText } from "@/lib/sanitize";

type ComparisonToolInput = Pick<
  Tool,
  | "name"
  | "pricing"
  | "category"
  | "categorySlug"
  | "tagline"
  | "description"
  | "tags"
  | "rating"
  | "reviewCount"
  | "favoritesCount"
  | "viewsCount"
  | "trendingScore"
>;

const finderInsightSchema = z.object({
  summary: z.string().min(1).max(240),
  idealUser: z.string().min(1).max(180),
  budgetPreference: z.enum(["free", "freemium", "paid", "unknown"]),
  inferredCategories: z.array(z.string().trim().min(1).max(64)).max(4),
  inferredTags: z.array(z.string().trim().min(1).max(32)).max(8),
  evaluationCriteria: z.array(z.string().trim().min(1).max(96)).max(5),
  followUpQueries: z.array(z.string().trim().min(1).max(120)).max(4)
});

const submissionDraftSchema = z.object({
  tagline: z.string().min(10).max(140),
  description: z.string().min(40).max(600),
  categorySlug: z.string().trim().min(1).max(64),
  tags: z.array(z.string().trim().min(1).max(32)).min(3).max(8),
  pricing: z.enum(["Free", "Freemium", "Paid"])
});

const submissionReviewSchema = z.object({
  summary: z.string().min(1).max(320),
  qualityScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  suggestedCategorySlug: z.string().trim().min(1).max(64),
  suggestedTags: z.array(z.string().trim().min(1).max(32)).max(8),
  recommendedAction: z.enum(["approve", "review", "reject"]),
  riskFlags: z.array(z.string().trim().min(1).max(96)).max(6),
  isLikelyAiTool: z.boolean()
});

const comparisonInsightSchema = z.object({
  headline: z.string().min(1).max(180),
  verdict: z.string().min(1).max(420),
  toolAPros: z.array(z.string().trim().min(1).max(140)).max(3),
  toolACons: z.array(z.string().trim().min(1).max(140)).max(3),
  toolBPros: z.array(z.string().trim().min(1).max(140)).max(3),
  toolBCons: z.array(z.string().trim().min(1).max(140)).max(3),
  chooseToolAFor: z.array(z.string().trim().min(1).max(120)).max(3),
  chooseToolBFor: z.array(z.string().trim().min(1).max(120)).max(3)
});

function normalizeCategorySlug(value: string, categories: Category[]) {
  const normalized = value.trim().toLowerCase();
  return categories.find((category) => category.slug === normalized)?.slug ?? categories[0]?.slug ?? normalized;
}

function normalizeTags(tags: string[]) {
  return sanitizeTagList(tags).slice(0, 8);
}

async function parseStructuredOutput<T extends z.ZodTypeAny>(input: {
  instructions: string;
  userMessage: string;
  schema: T;
  schemaName: string;
}) {
  if (!hasOpenAIConfig()) {
    return null;
  }

  try {
    const response = await getOpenAIClient().responses.parse({
      model: getOpenAIModel(),
      input: [
        {
          role: "system",
          content: input.instructions
        },
        {
          role: "user",
          content: input.userMessage
        }
      ],
      text: {
        format: zodTextFormat(input.schema, input.schemaName)
      }
    });

    return response.output_parsed ?? null;
  } catch (error) {
    console.error("OpenAI structured parse failed", error);
    return null;
  }
}

function stringifyCategoryList(categories: Category[]) {
  return categories.map((category) => `${category.slug}: ${category.name}`).join("\n");
}

function summarizeTool(tool: ComparisonToolInput) {
  return {
    name: tool.name,
    pricing: tool.pricing,
    category: tool.category,
    categorySlug: tool.categorySlug,
    tagline: tool.tagline,
    description: tool.description,
    tags: tool.tags,
    rating: tool.rating,
    reviewCount: tool.reviewCount,
    favoritesCount: tool.favoritesCount,
    viewsCount: tool.viewsCount,
    trendingScore: tool.trendingScore
  };
}

export class AIAssistantService {
  static isEnabled() {
    return hasOpenAIConfig();
  }

  static async enhanceFinderQuery(input: {
    query: string;
    categories: Category[];
  }): Promise<
    (FinderAssistantInsight & {
      inferredCategories: string[];
      inferredTags: string[];
    }) | null
  > {
    const parsed = await parseStructuredOutput({
      schema: finderInsightSchema,
      schemaName: "finder_insight",
      instructions:
        "You improve AI tool discovery queries. Infer the strongest categories, tags, budget preference, and evaluation criteria. Stay concise and use only category slugs from the provided list.",
      userMessage: [
        `User query:\n${input.query}`,
        `Available categories:\n${stringifyCategoryList(input.categories)}`
      ].join("\n\n")
    });

    if (!parsed) {
      return null;
    }

    return {
      summary: sanitizeText(parsed.summary),
      idealUser: sanitizeText(parsed.idealUser),
      budgetPreference: parsed.budgetPreference,
      evaluationCriteria: parsed.evaluationCriteria.map((item) => sanitizeText(item)).slice(0, 5),
      followUpQueries: parsed.followUpQueries.map((item) => sanitizeText(item)).slice(0, 4),
      inferredCategories: parsed.inferredCategories
        .map((value) => normalizeCategorySlug(value, input.categories))
        .filter((value, index, collection) => collection.indexOf(value) === index)
        .slice(0, 4),
      inferredTags: normalizeTags(parsed.inferredTags)
    };
  }

  static async generateSubmissionDraft(input: {
    name?: string;
    website?: string;
    tagline?: string;
    description?: string;
    categories: Category[];
  }) {
    const parsed = await parseStructuredOutput({
      schema: submissionDraftSchema,
      schemaName: "submission_draft",
      instructions:
        "You write marketplace-ready AI tool listings. Return a polished tagline, a concise description, the best matching category slug, 3-8 tags, and the likeliest pricing tier. Use only category slugs from the provided list.",
      userMessage: [
        `Known fields:\n${JSON.stringify({
          name: input.name ?? "",
          website: input.website ?? "",
          tagline: input.tagline ?? "",
          description: input.description ?? ""
        }, null, 2)}`,
        `Available categories:\n${stringifyCategoryList(input.categories)}`
      ].join("\n\n")
    });

    if (!parsed) {
      return null;
    }

    return {
      tagline: sanitizeText(parsed.tagline),
      description: sanitizeText(parsed.description),
      categorySlug: normalizeCategorySlug(parsed.categorySlug, input.categories),
      tags: normalizeTags(parsed.tags),
      pricing: parsed.pricing
    };
  }

  static async reviewSubmission(input: {
    name: string;
    tagline: string;
    website: string;
    description: string;
    categorySlug: string;
    tags: string[];
    pricing: "Free" | "Freemium" | "Paid";
    categories: Category[];
  }): Promise<SubmissionAIReview | null> {
    const parsed = await parseStructuredOutput({
      schema: submissionReviewSchema,
      schemaName: "submission_review",
      instructions:
        "You review AI tool directory submissions for quality and relevance. Assess whether it is likely a real AI tool, estimate listing quality, suggest the best category, flag risks, and recommend approve, review, or reject. Use only category slugs from the provided list.",
      userMessage: [
        `Submission:\n${JSON.stringify({
          name: input.name,
          tagline: input.tagline,
          website: input.website,
          description: input.description,
          categorySlug: input.categorySlug,
          tags: input.tags,
          pricing: input.pricing
        }, null, 2)}`,
        `Available categories:\n${stringifyCategoryList(input.categories)}`
      ].join("\n\n")
    });

    if (!parsed) {
      return null;
    }

    return {
      summary: sanitizeText(parsed.summary),
      qualityScore: Math.max(0, Math.min(100, Math.round(parsed.qualityScore))),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence.toFixed(2)))),
      suggestedCategorySlug: normalizeCategorySlug(parsed.suggestedCategorySlug, input.categories),
      suggestedTags: normalizeTags(parsed.suggestedTags),
      recommendedAction: parsed.recommendedAction,
      riskFlags: parsed.riskFlags.map((item) => sanitizeText(item)).slice(0, 6),
      isLikelyAiTool: parsed.isLikelyAiTool,
      analyzedAt: new Date().toISOString()
    };
  }

  static async summarizeComparison(
    toolA: ComparisonToolInput,
    toolB: ComparisonToolInput
  ): Promise<ComparisonAssistantInsight | null> {
    const parsed = await parseStructuredOutput({
      schema: comparisonInsightSchema,
      schemaName: "comparison_insight",
      instructions:
        "You compare AI tools for buyers. Produce a concise verdict plus practical pros, cons, and use cases for each tool. Base the answer only on the supplied metadata.",
      userMessage: JSON.stringify(
        {
          toolA: summarizeTool(toolA),
          toolB: summarizeTool(toolB)
        },
        null,
        2
      )
    });

    if (!parsed) {
      return null;
    }

    return {
      headline: sanitizeText(parsed.headline),
      verdict: sanitizeText(parsed.verdict),
      toolAPros: parsed.toolAPros.map((item) => sanitizeText(item)).slice(0, 3),
      toolACons: parsed.toolACons.map((item) => sanitizeText(item)).slice(0, 3),
      toolBPros: parsed.toolBPros.map((item) => sanitizeText(item)).slice(0, 3),
      toolBCons: parsed.toolBCons.map((item) => sanitizeText(item)).slice(0, 3),
      chooseToolAFor: parsed.chooseToolAFor.map((item) => sanitizeText(item)).slice(0, 3),
      chooseToolBFor: parsed.chooseToolBFor.map((item) => sanitizeText(item)).slice(0, 3)
    };
  }
}
