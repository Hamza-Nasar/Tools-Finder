import type { Workflow } from "@/types";

export const workflows: Workflow[] = [
  {
    slug: "launch-a-weekly-youtube-content-engine",
    title: "Launch a weekly YouTube content engine",
    description:
      "A repeatable workflow for generating video ideas, thumbnail concepts, scripts, and publishing assets with AI tools.",
    audience: "Creators and small media teams",
    outcome: "Ship YouTube videos faster with a tighter pre-production process.",
    toolsUsed: ["chatgpt", "midjourney", "notion-ai"],
    steps: [
      {
        title: "Research angles and audience pain points",
        description: "Use research-focused AI to gather hooks, titles, and content angles from audience questions.",
        toolSlugs: ["chatgpt"]
      },
      {
        title: "Draft the outline and talking points",
        description: "Turn the winning angle into a script outline with key beats, transitions, and CTA moments.",
        toolSlugs: ["chatgpt", "notion-ai"]
      },
      {
        title: "Generate thumbnail concepts",
        description: "Create several visual directions for testing before production starts.",
        toolSlugs: ["midjourney"]
      }
    ]
  },
  {
    slug: "ship-a-product-launch-campaign",
    title: "Ship a product launch campaign",
    description:
      "Plan the launch narrative, ad copy, landing page messaging, and creative variations for a coordinated product release.",
    audience: "Growth and marketing teams",
    outcome: "Move from launch brief to campaign assets with less back-and-forth.",
    toolsUsed: ["jasper", "chatgpt", "midjourney"],
    steps: [
      {
        title: "Turn the product brief into campaign angles",
        description: "Create positioning statements, value props, and audience angles that can feed every launch asset.",
        toolSlugs: ["chatgpt", "jasper"]
      },
      {
        title: "Generate ads and landing page copy",
        description: "Write multiple paid and landing page variants for rapid testing.",
        toolSlugs: ["jasper"]
      },
      {
        title: "Create campaign visuals",
        description: "Explore moodboards, visual directions, and social creatives before handing off for production.",
        toolSlugs: ["midjourney"]
      }
    ]
  },
  {
    slug: "debug-and-refactor-a-production-feature",
    title: "Debug and refactor a production feature",
    description:
      "A practical engineering workflow for isolating bugs, planning refactors, and tightening code review readiness.",
    audience: "Product engineers and small dev teams",
    outcome: "Reduce debugging time and make refactors safer to ship.",
    toolsUsed: ["github-copilot", "claude", "chatgpt"],
    steps: [
      {
        title: "Summarize the bug and likely causes",
        description: "Turn noisy issue reports into clear root-cause hypotheses and verification steps.",
        toolSlugs: ["claude", "chatgpt"]
      },
      {
        title: "Plan the refactor incrementally",
        description: "Break the implementation into low-risk steps with clear test coverage expectations.",
        toolSlugs: ["github-copilot"]
      },
      {
        title: "Generate tests and review notes",
        description: "Prepare regression tests and a concise implementation summary for the pull request.",
        toolSlugs: ["github-copilot", "claude"]
      }
    ]
  }
];

export function getWorkflowBySlug(slug: string) {
  return workflows.find((workflow) => workflow.slug === slug) ?? null;
}
