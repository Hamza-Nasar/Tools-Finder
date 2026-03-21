export interface SeoLandingConfig {
  path?: string;
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  relatedLinks?: Array<{
    href: string;
    label: string;
  }>;
  query: {
    category?: string;
    tags?: string[];
    pricing?: "Free" | "Freemium" | "Paid";
    featured?: boolean;
    sort?: "newest" | "popular" | "favorited" | "featured";
    limit?: number;
  };
}

export const seoLandingPages: SeoLandingConfig[] = [
  {
    slug: "best-ai-tools",
    title: "Best AI Tools",
    description:
      "Discover the best AI tools across writing, coding, research, productivity, and marketing with curated rankings and structured filters.",
    eyebrow: "Best of",
    heading: "The best AI tools worth evaluating right now.",
    intro:
      "This landing page pulls directly from the live directory so search visitors always see current tools, not a stale editorial list.",
    query: {
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/tools", label: "Browse the full directory" },
      { href: "/today-ai-tools", label: "See what is trending today" }
    ]
  },
  {
    slug: "best-ai-tools-for-students",
    title: "Best AI Tools for Students",
    description:
      "Explore the best AI tools for students, including research, writing, note-taking, and study workflow products with accessible pricing.",
    eyebrow: "Students",
    heading: "AI tools for students who need better output with less friction.",
    intro:
      "These tools are selected from the live directory with a bias toward accessible pricing and practical daily workflows such as writing, research, and productivity.",
    query: {
      pricing: "Free",
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/find-ai-tool", label: "Use the AI tool finder" },
      { href: "/prompts", label: "Explore the prompt library" }
    ]
  },
  {
    slug: "best-ai-tools-for-developers",
    title: "Best AI Tools for Developers",
    description:
      "Browse the best AI tools for developers, including coding assistants, debugging products, workflow copilots, and engineering automation tools.",
    eyebrow: "Developers",
    heading: "AI tools for developers building faster shipping loops.",
    intro:
      "This page focuses on live coding and engineering tools from the directory, ordered for teams evaluating developer productivity and workflow automation products.",
    query: {
      category: "coding",
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/workflows/debug-and-refactor-a-production-feature", label: "Open the engineering workflow" },
      { href: "/compare/chatgpt-vs-claude", label: "Compare leading coding copilots" }
    ]
  },
  {
    slug: "best-free-ai-tools",
    title: "Best Free AI Tools",
    description:
      "Find the best free AI tools across major categories, with dynamic listings for zero-cost products and free plans that are easy to test.",
    eyebrow: "Free tools",
    heading: "The best free AI tools to try before paying for a stack.",
    intro:
      "This page updates from the live catalog and helps search visitors find free AI tools they can start using immediately without a sales cycle.",
    query: {
      pricing: "Free",
      sort: "featured",
      limit: 12
    }
  },
  {
    slug: "ai-tools-for-youtubers",
    title: "AI Tools for YouTubers",
    description:
      "Discover AI tools for YouTubers, including video editors, thumbnail generators, script assistants, and creator workflow tools.",
    eyebrow: "Creators",
    heading: "AI tools for YouTubers building a faster content machine.",
    intro:
      "This page curates creator-focused AI tools from the live directory, with a bias toward video production, ideation, thumbnails, and publishing support.",
    query: {
      category: "video",
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/workflows/launch-a-weekly-youtube-content-engine", label: "Open the YouTube workflow" },
      { href: "/today-ai-tools", label: "See the daily tools feed" }
    ]
  },
  {
    slug: "ai-tools-for-marketers",
    title: "AI Tools for Marketers",
    description:
      "Explore AI tools for marketers across campaign planning, SEO, copywriting, ad creative, research, and product launch workflows.",
    eyebrow: "Marketing",
    heading: "AI tools for marketers who need faster campaigns and sharper positioning.",
    intro:
      "These tools are selected from the live catalog for growth teams, content marketers, and launch operators evaluating campaign execution and workflow speed.",
    query: {
      category: "marketing",
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/workflows/ship-a-product-launch-campaign", label: "Open the launch campaign workflow" },
      { href: "/prompts", label: "Browse high-performing prompts" }
    ]
  },
  {
    slug: "ai-tools-for-designers",
    title: "AI Tools for Designers",
    description:
      "Find AI tools for designers, including visual generation, mockups, UI exploration, presentation tools, and creative production software.",
    eyebrow: "Design",
    heading: "AI tools for designers shaping faster visual exploration loops.",
    intro:
      "This landing page surfaces design-oriented AI products from the directory to help designers compare visual, presentation, and interface tools without rebuilding the filters from scratch.",
    query: {
      category: "design",
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/collections/ai-tools-for-designers", label: "Open the designer collection" },
      { href: "/alternatives/midjourney", label: "See Midjourney alternatives" }
    ]
  },
  {
    slug: "ai-tools-for-bloggers",
    title: "AI Tools for Bloggers",
    description:
      "Browse AI tools for bloggers across writing, SEO, editing, idea generation, outlining, and content repurposing workflows.",
    eyebrow: "Blogging",
    heading: "AI tools for bloggers who want a stronger writing and distribution stack.",
    intro:
      "These live directory results focus on writing and publishing workflows for independent bloggers, editorial teams, and SEO-focused content operations.",
    query: {
      category: "writing",
      sort: "popular",
      limit: 12
    },
    relatedLinks: [
      { href: "/best-ai-tools", label: "See the broader best AI tools list" },
      { href: "/find-ai-tool", label: "Use the tool recommender" }
    ]
  }
];

export function getSeoLandingConfig(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug) ?? null;
}
