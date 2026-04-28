import type {
  AlternativeSystemPath,
  HiddenOpportunityLayer,
  IntelligenceContext,
  IntelligenceSkillLevel,
  IntentUnderstanding,
  ProblemDecompositionStep,
  ProductIntelligenceOutput,
  SmartDecisionEngine,
  Tool,
  ToolRecommendation,
  ToolSystemItem,
  WorkflowExecutionStep
} from "@/types";
import { CategoryService } from "@/lib/services/category-service";
import { computeToolFitScore } from "@/lib/fit-score";
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

const CONTEXT_KEYWORDS: Record<IntelligenceContext, string[]> = {
  student: ["assignment", "class", "college", "homework", "notes", "paper", "research", "school", "study", "student"],
  creator: [
    "blog",
    "creator",
    "image",
    "newsletter",
    "podcast",
    "post",
    "script",
    "social",
    "thumbnail",
    "video",
    "youtube"
  ],
  developer: ["api", "app", "bug", "code", "coding", "debug", "developer", "programming", "refactor", "software"],
  business: ["ads", "business", "campaign", "client", "crm", "customer", "lead", "marketing", "sales", "startup", "team"],
  "casual user": []
};

const BEGINNER_KEYWORDS = ["beginner", "easy", "fast", "no code", "quick", "simple", "student"];
const ADVANCED_KEYWORDS = ["api", "automation", "integrate", "pipeline", "production", "scale", "sdk", "workflow"];
const COST_KEYWORDS = ["budget", "cheap", "free", "low cost", "no cost"];
const SPEED_KEYWORDS = ["fast", "quick", "rapid", "today", "urgent"];
const SIMPLICITY_KEYWORDS = ["beginner", "easy", "no code", "simple"];
const EFFICIENCY_KEYWORDS = ["automate", "efficient", "optimize", "productivity", "repeat", "scale", "workflow"];

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    .slice(0, 12);
}

function includesAny(input: string, keywords: readonly string[]) {
  return keywords.some((keyword) => input.includes(keyword));
}

function detectContext(query: string): IntelligenceContext {
  const lowerQuery = query.toLowerCase();
  const orderedContexts: IntelligenceContext[] = ["developer", "business", "creator", "student"];

  return orderedContexts.find((context) => includesAny(lowerQuery, CONTEXT_KEYWORDS[context])) ?? "casual user";
}

function detectSkillLevel(query: string): IntelligenceSkillLevel {
  const lowerQuery = query.toLowerCase();

  if (includesAny(lowerQuery, BEGINNER_KEYWORDS)) {
    return "beginner";
  }

  if (includesAny(lowerQuery, ADVANCED_KEYWORDS)) {
    return "advanced";
  }

  return "intermediate";
}

function detectOptimizationPriority(query: string, skillLevel: IntelligenceSkillLevel) {
  const lowerQuery = query.toLowerCase();
  const priorities: IntentUnderstanding["optimizationPriority"] = [];
  const addPriority = (priority: IntentUnderstanding["optimizationPriority"][number]) => {
    if (!priorities.includes(priority)) {
      priorities.push(priority);
    }
  };

  if (includesAny(lowerQuery, SPEED_KEYWORDS)) addPriority("speed");
  if (includesAny(lowerQuery, SIMPLICITY_KEYWORDS) || skillLevel === "beginner") addPriority("simplicity");
  if (includesAny(lowerQuery, COST_KEYWORDS)) addPriority("cost");
  if (includesAny(lowerQuery, EFFICIENCY_KEYWORDS) || skillLevel === "advanced") addPriority("efficiency");

  addPriority("speed");
  addPriority("simplicity");
  addPriority("cost");
  addPriority("efficiency");

  return priorities.slice(0, 4);
}

function buildIntentUnderstanding(query: string): IntentUnderstanding {
  const context = detectContext(query);
  const skillLevel = detectSkillLevel(query);
  const cleanQuery = query.trim();

  return {
    statedIntent: cleanQuery,
    hiddenGoal:
      context === "developer"
        ? "Reduce technical uncertainty and reach a shippable implementation path with fewer trial-and-error loops."
        : context === "business"
          ? "Find a reliable tool setup that improves output speed without adding unnecessary operational cost."
          : context === "creator"
            ? "Move from an idea to a finished asset or publishing workflow without juggling random tools."
            : context === "student"
              ? "Finish the learning or research task faster while keeping the result clear, credible, and reusable."
              : "Solve the task quickly with a practical tool choice instead of browsing a broad directory.",
    simpleGoal: `Find the best AI tool workflow for: ${cleanQuery}`,
    context,
    skillLevel,
    optimizationPriority: detectOptimizationPriority(cleanQuery, skillLevel)
  };
}

function buildProblemDecomposition(intent: IntentUnderstanding): ProblemDecompositionStep[] {
  return [
    {
      step: 1,
      phase: "ideation/input",
      objective: `Clarify the exact job, constraints, audience, and success criteria for a ${intent.context} use case.`
    },
    {
      step: 2,
      phase: "creation/process",
      objective: "Choose the smallest useful tool system and map each tool to a distinct workflow role."
    },
    {
      step: 3,
      phase: "execution/output",
      objective: "Run the task through the selected tool sequence until there is a concrete output to review."
    },
    {
      step: 4,
      phase: "optimization",
      objective: "Improve quality, reduce cost or effort, and convert the result into a repeatable workflow."
    }
  ];
}

function getToolRole(tool: Tool, index: number) {
  const haystack = `${tool.categorySlug} ${tool.category} ${tool.tags.join(" ")}`.toLowerCase();

  if (includesAny(haystack, ["code", "developer", "programming"])) {
    return "Build and implementation layer";
  }

  if (includesAny(haystack, ["research", "study", "summarizer"])) {
    return "Research and synthesis layer";
  }

  if (includesAny(haystack, ["writing", "copywriting", "content", "seo"])) {
    return "Content creation layer";
  }

  if (includesAny(haystack, ["design", "image", "creative", "video", "audio"])) {
    return "Creative production layer";
  }

  if (includesAny(haystack, ["marketing", "ads", "sales"])) {
    return "Growth execution layer";
  }

  if (index === 0) {
    return "Primary execution layer";
  }

  if (index === 1) {
    return "Planning and support layer";
  }

  return "Enhancement layer";
}

function getToolUsageTiming(tool: Tool) {
  if (tool.pricing === "Free") {
    return "Use it first when the workflow must stay free or when you need to validate fit quickly.";
  }

  if (tool.pricing === "Freemium") {
    return "Use it when the free tier can validate the workflow before paid scale-up.";
  }

  return "Use it when quality, reliability, or team features justify a paid tool.";
}

function buildToolSystem(recommendations: ToolRecommendation[]): ToolSystemItem[] {
  return recommendations.slice(0, 5).map((recommendation, index, selectedRecommendations) => {
    const previousTool = selectedRecommendations[index - 1]?.tool;
    const nextTool = selectedRecommendations[index + 1]?.tool;
    const reason = recommendation.reason || `fits the ${recommendation.tool.category.toLowerCase()} workflow`;

    return {
      tool: recommendation.tool,
      roleInWorkflow: getToolRole(recommendation.tool, index),
      whyItExists: `${recommendation.tool.name} exists in this system because it ${reason}.`,
      dependencyRelation:
        index === 0
          ? nextTool
            ? `Use as the anchor tool, then pass the result to ${nextTool.name} when specialist support is needed.`
            : "Use as the complete workflow anchor when one tool is enough."
          : previousTool
            ? `Use after ${previousTool.name} to strengthen or specialize the previous output.`
            : "Use as a supporting tool when the primary workflow needs more coverage.",
      whenToUse: getToolUsageTiming(recommendation.tool)
    };
  });
}

function buildDecisionEngine(recommendations: ToolRecommendation[], intent: IntentUnderstanding): SmartDecisionEngine {
  const [topRecommendation, secondRecommendation] = recommendations;

  if (!topRecommendation) {
    return {
      selectionType: "Best Single Tool",
      winner: "No confident match",
      whyItWins: "The query does not have enough matching directory signals to choose a reliable tool system.",
      tradeoffs: ["A broader directory search may be needed.", "The user may need to add task, audience, or budget details."],
      whenItFails: ["The query stays vague.", "The required tool category is missing from the catalog."]
    };
  }

  const scoreLead = topRecommendation.score - (secondRecommendation?.score ?? 0);
  const shouldUseSingleTool = recommendations.length === 1 || scoreLead >= 8;

  if (shouldUseSingleTool) {
    return {
      selectionType: "Best Single Tool",
      winner: topRecommendation.tool.name,
      whyItWins: `${topRecommendation.tool.name} has the strongest match to the inferred intent, category, and tag signals while keeping the workflow simple.`,
      tradeoffs: [
        "A single-tool path is faster but may miss specialist features.",
        "The final choice should still be checked against pricing, privacy, and export needs."
      ],
      whenItFails: [
        "The user needs multiple output formats or team handoffs.",
        "The task requires deep specialization outside the tool's main category."
      ]
    };
  }

  const toolNames = recommendations.slice(0, Math.min(3, recommendations.length)).map((recommendation) => recommendation.tool.name);

  return {
    selectionType: "Best Tool Combination System",
    winner: toolNames.join(" + "),
    whyItWins: `The combination covers ${intent.simpleGoal.toLowerCase()} with separate roles for planning, production, and optimization instead of relying on one broad tool.`,
    tradeoffs: [
      "A combination creates more handoffs than a single-tool workflow.",
      "Users should avoid adding every recommended tool before validating the first output."
    ],
    whenItFails: [
      "The user needs the absolute fastest one-click result.",
      "Tool handoffs become more expensive or slower than the value they add."
    ]
  };
}

function pickToolName(recommendations: ToolRecommendation[], index: number) {
  return recommendations[index]?.tool.name ?? recommendations[0]?.tool.name ?? "the selected tool";
}

function buildWorkflow(recommendations: ToolRecommendation[], intent: IntentUnderstanding): WorkflowExecutionStep[] {
  return [
    {
      stage: "Idea",
      toolUsage: `Use ${pickToolName(recommendations, 0)} to turn the raw request into a clear task brief.`,
      userAction: "Write the problem, desired output, budget limit, and audience in one short brief.",
      expectedOutcome: "A concrete input that removes ambiguity before tool execution starts."
    },
    {
      stage: "Plan",
      toolUsage: `Use ${pickToolName(recommendations, 1)} to structure the approach and identify missing inputs.`,
      userAction: "Choose the shortest workflow that can produce a useful first result.",
      expectedOutcome: "A step-by-step plan matched to the user's skill level and context."
    },
    {
      stage: "Create",
      toolUsage: `Use ${pickToolName(recommendations, 0)} as the main creation or execution tool.`,
      userAction: "Generate the first complete output instead of polishing fragments too early.",
      expectedOutcome: "A usable draft, asset, answer, code path, or campaign component."
    },
    {
      stage: "Enhance",
      toolUsage: `Use ${pickToolName(recommendations, 2)} to improve quality, coverage, or specialist output.`,
      userAction: "Check gaps, refine the output, and compare against the original goal.",
      expectedOutcome: "A stronger result with fewer weak spots and clearer fit."
    },
    {
      stage: "Publish",
      toolUsage: `Use ${pickToolName(recommendations, 3)} only if the workflow needs formatting, delivery, or handoff support.`,
      userAction: "Export, share, submit, or move the result into the target channel.",
      expectedOutcome: "The work reaches its intended destination in a usable format."
    },
    {
      stage: "Optimize",
      toolUsage: `Use ${pickToolName(recommendations, 4)} or the directory comparison flow to improve the system over time.`,
      userAction: `Review speed, simplicity, cost, and efficiency with priority on ${intent.optimizationPriority.join(", ")}.`,
      expectedOutcome: "A repeatable workflow that gets cheaper, faster, or more reliable on the next run."
    }
  ];
}

function buildHiddenOpportunities(
  recommendations: ToolRecommendation[],
  intent: IntentUnderstanding
): HiddenOpportunityLayer {
  const topToolName = recommendations[0]?.tool.name ?? "the selected tool";
  const contextAutomation =
    intent.context === "developer"
      ? "Connect issue summaries, implementation notes, and test generation into one development loop."
      : intent.context === "business"
        ? "Turn repeated campaign or sales tasks into reusable briefs, templates, and review checklists."
        : intent.context === "creator"
          ? "Create a repeatable pipeline from topic idea to script, asset generation, publishing, and repurposing."
          : intent.context === "student"
            ? "Create reusable study templates for notes, summaries, citations, and revision plans."
            : "Save the best prompt and output format so the same task is faster next time.";

  return {
    improvements: [
      "Add a clear success metric before choosing tools, such as time saved, output quality, or cost per finished result.",
      `Start with ${topToolName}, then add another tool only when a real workflow gap appears.`,
      "Validate privacy, export options, and pricing before moving important work into a tool."
    ],
    automationOpportunities: [
      contextAutomation,
      "Store the final tool sequence as a reusable stack instead of repeating discovery for the same task."
    ],
    productivityUpgrades: [
      "Create one reusable input brief template for this workflow.",
      "Keep a comparison note with what each tested tool did well, where it failed, and whether it deserves a paid plan."
    ],
    scalingIdeas: [
      "Move from one-off tool discovery to role-based stacks for beginner, pro, and free-only users.",
      "Track which recommended tools users save, click, and combine so future recommendations learn from workflow outcomes."
    ]
  };
}

function buildAlternativePaths(recommendations: ToolRecommendation[]): AlternativeSystemPath[] {
  const topTool = recommendations[0]?.tool;
  const proTools = recommendations.slice(0, 3).map((recommendation) => recommendation.tool.name);
  const freeTools = recommendations
    .filter((recommendation) => recommendation.tool.pricing !== "Paid")
    .slice(0, 3)
    .map((recommendation) => recommendation.tool.name);

  return [
    {
      name: "Beginner path",
      tools: topTool ? [topTool.name] : ["Directory search"],
      workflow: ["Describe the task clearly", "Use one tool end to end", "Review the result", "Save the winning setup"],
      bestFor: "Users who need the fastest path with minimal setup and fewer decisions."
    },
    {
      name: "Pro path",
      tools: proTools.length ? proTools : ["Directory search", "Comparison pages", "Workflow stack"],
      workflow: ["Map roles", "Assign each tool to a workflow step", "Run the handoff", "Measure quality and speed"],
      bestFor: "Users who care about repeatability, team handoffs, and higher-quality output."
    },
    {
      name: "Free-only path",
      tools: freeTools.length ? freeTools : ["Free directory filters"],
      workflow: ["Filter for Free or Freemium", "Validate with the smallest task", "Avoid paid upgrades until the gap is clear"],
      bestFor: "Users who need a no-cost workflow before committing budget."
    }
  ];
}

function buildProductIntelligence(query: string, recommendations: ToolRecommendation[]): ProductIntelligenceOutput {
  const intentUnderstanding = buildIntentUnderstanding(query);

  return {
    intentUnderstanding,
    problemDecomposition: buildProblemDecomposition(intentUnderstanding),
    toolSystem: buildToolSystem(recommendations),
    decisionEngine: buildDecisionEngine(recommendations, intentUnderstanding),
    workflow: buildWorkflow(recommendations, intentUnderstanding),
    hiddenOpportunities: buildHiddenOpportunities(recommendations, intentUnderstanding),
    alternativePaths: buildAlternativePaths(recommendations)
  };
}

function scoreTool(
  tool: Tool,
  query: string,
  tokens: string[],
  inferredCategories: string[],
  inferredTags: string[]
) {
  const lowerQuery = query.toLowerCase();
  const haystack = [tool.name, tool.tagline, tool.description, tool.category, ...tool.tags].join(" ").toLowerCase();
  const matchedCategories = inferredCategories.filter((slug) => slug === tool.categorySlug);
  const matchedTags = inferredTags.filter((tag) => tool.tags.map((value) => value.toLowerCase()).includes(tag));
  const phraseBoost = haystack.includes(lowerQuery) ? 12 : 0;
  const tokenBoost = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 1.8 : 0), 0);
  const categoryBoost = matchedCategories.length * 6;
  const tagBoost = matchedTags.length * 4;
  const pricingBoost =
    lowerQuery.includes("free") || lowerQuery.includes("cheap") || lowerQuery.includes("budget")
      ? tool.pricing === "Free"
        ? 4
        : tool.pricing === "Freemium"
          ? 2
          : 0
      : 0;
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
    tools: ToolRecommendation[];
    intelligence: ProductIntelligenceOutput;
  }> {
    const query = problem.trim();
    const effectiveLimit = Math.min(Math.max(limit, 1), 5);

    if (query.length < 3) {
      return {
        query,
        inferredCategories: [],
        inferredTags: [],
        tools: [],
        intelligence: buildProductIntelligence(query, [])
      };
    }

    const tokens = tokenize(query);
    const categories = await CategoryService.listPublicCategories();
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
        const scored = scoreTool(tool, query, tokens, inferredCategories, inferredTags);
        const fitScore = computeToolFitScore({
          tool,
          query,
          inferredCategories,
          inferredTags
        });

        return {
          tool,
          score: scored.score + fitScore.score / 5,
          reason: scored.reason,
          matchedCategories: scored.matchedCategories,
          matchedTags: scored.matchedTags,
          fitScore: fitScore.score,
          fitBreakdown: fitScore.breakdown
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, effectiveLimit);

    return {
      query,
      inferredCategories,
      inferredTags,
      tools: ranked,
      intelligence: buildProductIntelligence(query, ranked)
    };
  }
}
