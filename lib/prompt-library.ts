import type { PromptEntry, PromptToolGroup } from "@/types";

export const promptLibrary: PromptEntry[] = [
  {
    id: "chatgpt-content-brief",
    toolSlug: "chatgpt",
    toolName: "ChatGPT",
    title: "Turn a rough topic into a publishable content brief",
    category: "Writing",
    description: "Useful for blog planning, SEO content, and editorial calendars.",
    featured: true,
    prompt: `You are a senior content strategist.\nCreate a detailed content brief for the topic: "{{topic}}".\nInclude:\n1. target audience\n2. search intent\n3. article angle\n4. outline with H2/H3 sections\n5. FAQ ideas\n6. CTA recommendations\nKeep the tone clear, practical, and optimized for organic search.`
  },
  {
    id: "chatgpt-research-summary",
    toolSlug: "chatgpt",
    toolName: "ChatGPT",
    title: "Summarize research into decision-ready notes",
    category: "Research",
    description: "Condenses long documents into action-oriented summaries.",
    prompt: `Summarize the following research notes for an executive audience.\nOutput:\n- 5 key findings\n- 3 risks or caveats\n- 3 recommended next actions\n- a final one-paragraph summary\nNotes:\n{{research_notes}}`
  },
  {
    id: "claude-strategy-memo",
    toolSlug: "claude",
    toolName: "Claude",
    title: "Draft a strategy memo with tradeoffs",
    category: "Productivity",
    description: "Great for planning documents and internal alignment.",
    featured: true,
    prompt: `Act as a product strategist.\nWrite a strategy memo for "{{initiative}}".\nCover:\n- problem statement\n- goals\n- success metrics\n- recommended approach\n- tradeoffs\n- open questions\nUse concise, executive-ready language.`
  },
  {
    id: "claude-customer-insights",
    toolSlug: "claude",
    toolName: "Claude",
    title: "Extract insights from customer feedback",
    category: "Research",
    description: "Turns raw customer notes into themes, quotes, and priorities.",
    prompt: `Analyze the customer feedback below.\nReturn:\n- top themes\n- representative quotes\n- severity/urgency level for each theme\n- product opportunities\nFeedback:\n{{feedback}}`
  },
  {
    id: "midjourney-thumbnail-prompt",
    toolSlug: "midjourney",
    toolName: "Midjourney",
    title: "Generate a high-contrast YouTube thumbnail concept",
    category: "Design",
    description: "Designed for fast thumbnail ideation and strong contrast.",
    featured: true,
    prompt: `Create a YouTube thumbnail concept for "{{video_topic}}".\nStyle requirements:\n- dramatic lighting\n- bold contrast\n- clear focal subject\n- minimal clutter\n- highly clickable composition\n- cinematic color grade\nOutput as a Midjourney-ready prompt with visual details only.`
  },
  {
    id: "midjourney-brand-visual",
    toolSlug: "midjourney",
    toolName: "Midjourney",
    title: "Create a brand moodboard prompt",
    category: "Design",
    description: "Useful for early concept exploration for startups and campaigns.",
    prompt: `Write a Midjourney prompt for a brand moodboard.\nBrand: "{{brand_name}}"\nAttributes: {{attributes}}\nNeed:\n- color direction\n- texture ideas\n- composition references\n- photography or illustration style\nKeep it premium and cohesive.`
  },
  {
    id: "github-copilot-refactor",
    toolSlug: "github-copilot",
    toolName: "GitHub Copilot",
    title: "Guide a safe refactor plan",
    category: "Coding",
    description: "Helpful for breaking refactors into reversible engineering steps.",
    prompt: `You are assisting with a safe production refactor.\nGiven this code/context:\n{{code_context}}\nReturn:\n- refactor plan in steps\n- risks/regressions to watch for\n- tests to add first\n- suggested implementation order\nOptimize for low-risk incremental delivery.`
  },
  {
    id: "github-copilot-debugging",
    toolSlug: "github-copilot",
    toolName: "GitHub Copilot",
    title: "Debug a production issue systematically",
    category: "Coding",
    description: "Structures a debugging workflow before changing code.",
    prompt: `Analyze this bug report and code snippet.\nBug:\n{{bug_report}}\nCode:\n{{code}}\nProvide:\n- likely root causes\n- fastest verification steps\n- suggested fixes\n- regression tests to add after the fix`
  },
  {
    id: "notion-ai-meeting-notes",
    toolSlug: "notion-ai",
    toolName: "Notion AI",
    title: "Convert messy meeting notes into action items",
    category: "Productivity",
    description: "Great for async teams that need clear next steps.",
    prompt: `Transform these meeting notes into a clean summary.\nInclude:\n- decisions made\n- action items with owners\n- blockers\n- follow-up questions\nNotes:\n{{meeting_notes}}`
  },
  {
    id: "jasper-ad-copy",
    toolSlug: "jasper",
    toolName: "Jasper",
    title: "Generate paid ad variations fast",
    category: "Marketing",
    description: "Produces multiple copy angles for testing ad performance.",
    prompt: `Create 10 paid ad copy variations for "{{offer}}".\nAudience: {{audience}}\nEach variation should include:\n- headline\n- primary text\n- CTA\nMix emotional, benefit-led, and urgency-driven angles.`
  }
];

export function getPromptToolGroups(): PromptToolGroup[] {
  const groupMap = new Map<string, PromptEntry[]>();

  for (const prompt of promptLibrary) {
    const current = groupMap.get(prompt.toolSlug) ?? [];
    current.push(prompt);
    groupMap.set(prompt.toolSlug, current);
  }

  return Array.from(groupMap.entries())
    .map(([slug, prompts]) => ({
      slug,
      toolName: prompts[0]?.toolName ?? slug,
      description: `Reusable prompts and workflows for ${prompts[0]?.toolName ?? slug}.`,
      promptCount: prompts.length,
      prompts
    }))
    .sort((left, right) => right.promptCount - left.promptCount || left.toolName.localeCompare(right.toolName));
}

export function getPromptsForTool(slug: string) {
  return promptLibrary.filter((prompt) => prompt.toolSlug === slug);
}

export function getPromptToolGroup(slug: string) {
  return getPromptToolGroups().find((group) => group.slug === slug) ?? null;
}

export function getPopularPrompts(limit = 4) {
  return promptLibrary
    .filter((prompt) => prompt.featured)
    .slice(0, limit);
}
