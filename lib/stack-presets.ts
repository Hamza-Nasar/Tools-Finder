import type { FeaturedStackPreset } from "@/types";

export const featuredStackPresets: FeaturedStackPreset[] = [
  {
    slug: "creator-stack",
    title: "Creator Stack",
    description: "A lean stack for ideation, scripts, thumbnails, and publishing support.",
    audience: "Solo creators",
    toolSlugs: ["chatgpt", "midjourney", "notion-ai"]
  },
  {
    slug: "growth-stack",
    title: "Growth Stack",
    description: "Campaign planning, ad generation, and creative exploration for launch-focused teams.",
    audience: "Marketing teams",
    toolSlugs: ["jasper", "chatgpt", "midjourney"]
  },
  {
    slug: "engineering-stack",
    title: "Engineering Stack",
    description: "Debugging, refactor planning, and research support for product engineering work.",
    audience: "Developers",
    toolSlugs: ["github-copilot", "claude", "chatgpt"]
  }
];
