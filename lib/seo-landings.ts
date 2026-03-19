export interface SeoLandingConfig {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  query: {
    category?: string;
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
    }
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
    }
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
    }
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
  }
];

export function getSeoLandingConfig(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug) ?? null;
}
