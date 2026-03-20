import type { PricingTier } from "@/types";

export interface ToolCollectionDefinition {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  categorySlugs?: string[];
  tags?: string[];
  pricing?: PricingTier;
}

export const toolCollections: ToolCollectionDefinition[] = [
  {
    slug: "ai-tools-for-students",
    title: "AI Tools for Students",
    description:
      "Study assistants, summarizers, note-taking tools, and research products that help students move faster without losing clarity.",
    eyebrow: "Curated collection",
    categorySlugs: ["research", "productivity", "writing"],
    tags: ["study", "notes", "research", "summarizer", "education"]
  },
  {
    slug: "ai-tools-for-developers",
    title: "AI Tools for Developers",
    description:
      "Coding copilots, debugging tools, API assistants, and engineering-focused AI products for modern software teams.",
    eyebrow: "Curated collection",
    categorySlugs: ["coding", "research", "productivity"],
    tags: ["code", "developer", "programming", "api", "automation"]
  },
  {
    slug: "ai-tools-for-designers",
    title: "AI Tools for Designers",
    description:
      "Design, image-generation, and prototyping tools that help product and brand teams explore concepts faster.",
    eyebrow: "Curated collection",
    categorySlugs: ["design", "image-generation", "video"],
    tags: ["design", "image", "creative", "prototype", "visual"]
  }
];

export function getToolCollectionBySlug(slug: string) {
  return toolCollections.find((collection) => collection.slug === slug) ?? null;
}
