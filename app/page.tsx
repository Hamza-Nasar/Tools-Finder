import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Blocks,
  BrainCircuit,
  Flame,
  Radar,
  Sparkles,
  Workflow
} from "lucide-react";
import { getPublicCategories } from "@/lib/data/categories";
import { getHomepageTools, getTodayToolsFeedCached } from "@/lib/data/tools";
import { getFeaturedStackPreviews } from "@/lib/data/stacks";
import { toolCollections } from "@/lib/collections";
import { getPopularPrompts } from "@/lib/prompt-library";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { workflows } from "@/lib/workflows";
import { compactNumber } from "@/lib/utils";
import { CollectionGrid } from "@/components/collections/collection-grid";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { HeroSection } from "@/components/marketing/hero-section";
import { ToolSection } from "@/components/marketing/tool-section";
import { PromptCard } from "@/components/prompts/prompt-card";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { FeaturedStackGrid } from "@/components/tools/featured-stack-grid";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";
import { WorkflowCard } from "@/components/workflows/workflow-card";

interface RouteCard {
  title: string;
  description: string;
  href: string;
  metric: string;
  icon: LucideIcon;
}

interface AdvantageCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AudienceCard {
  title: string;
  description: string;
  eyebrow: string;
  href: string;
  cta: string;
  bullets: string[];
  icon: LucideIcon;
}

export const metadata = buildMetadata({
  title: "Best Free Online Tools 2026: Fast SEO Tools, PDF & Image Tools | No Signup",
  description:
    "Find the best free online tools for SEO, PDF, image and AI workflows. Fast, no signup discovery with instant comparisons and trusted picks.",
  path: "/",
  keywords: [
    "free online tools",
    "SEO tools",
    "PDF tools",
    "image tools",
    "best free online tools 2026",
    "no signup tools"
  ]
});

const landingRoutes = [
  {
    href: "/seo-tools",
    title: "Free SEO tools",
    description: "Instant SEO audits, keyword research, metadata ideas, and CTR-focused optimization workflows."
  },
  {
    href: "/pdf-tools",
    title: "Free PDF tools",
    description: "Fast PDF compression, conversion, merge, split, and document cleanup routes for everyday work."
  },
  {
    href: "/image-tools",
    title: "Free image tools",
    description: "Browser-based image compression, resizing, conversion, cleanup, and AI visual discovery."
  },
  {
    href: "/blog/best-free-seo-tools-2026",
    title: "Best free SEO tools 2026",
    description: "A practical article linking SEO audits, keyword research, title optimization, and CTR improvements."
  },
  {
    href: "/blog/how-to-compress-images-online",
    title: "How to compress images online",
    description: "A step-by-step guide that connects image compression, resizing, conversion, alt text, and page speed."
  },
  {
    href: "/blog/best-pdf-tools-free",
    title: "Best free PDF tools",
    description: "A document workflow guide linking PDF merger, compressor, splitter, and converter pages."
  },
  {
    href: "/best-ai-tools",
    title: "Best AI tools",
    description: "A broad, high-intent page for visitors who want the strongest overall shortlist."
  },
  {
    href: "/best-free-ai-tools",
    title: "Best free AI tools",
    description: "Catch price-sensitive traffic and route users into credible free and freemium options."
  },
  {
    href: "/best-ai-tools-for-developers",
    title: "Best AI tools for developers",
    description: "A focused lane for coding copilots, debugging assistants, and software workflows."
  },
  {
    href: "/ai-tools-for-marketers",
    title: "AI tools for marketers",
    description: "Performance-focused discovery around campaign ops, content, and growth experimentation."
  },
  {
    href: "/ai-tools-for-designers",
    title: "AI tools for designers",
    description: "Landing pages and visual AI routes for image generation, concepts, and creative systems."
  },
  {
    href: "/ai-tools-for-youtubers",
    title: "AI tools for YouTubers",
    description: "Target creator intent with pages around thumbnails, scripting, editing, and packaging."
  }
];

const faqEntries = [
  {
    question: "How do I pick the right AI tool when multiple products look similar?",
    answer:
      "Start with the AI Finder or a focused category page, then compare the shortlisted tools by pricing, tags, popularity, and related workflows instead of relying on brand awareness alone."
  },
  {
    question: "Does the directory only surface paid tools?",
    answer:
      "No. The catalog includes free, freemium, and paid products, and dedicated landing pages help visitors find strong free options quickly."
  },
  {
    question: "What makes a tool trend on the platform?",
    answer:
      "Trending surfaces blend recent views, favorites, and live discovery activity so rising tools can appear before they become saturated elsewhere."
  },
  {
    question: "Can founders feature their product without breaking trust?",
    answer:
      "Yes. Featured placement exists as a clear premium surface, while the rest of the product still uses ranking, moderation, and category structure to keep discovery useful."
  }
];

const toolFitPillars = [
  {
    title: "Task fit",
    detail: "How directly the tool solves the exact workflow a visitor described."
  },
  {
    title: "Setup friction",
    detail: "How quickly users can get value without long onboarding or unnecessary signup steps."
  },
  {
    title: "Stack compatibility",
    detail: "How well the tool connects with common creator, marketing, developer, and research workflows."
  },
  {
    title: "Market momentum",
    detail: "How strong the recent discovery signals are based on views, favorites, and activity."
  }
] as const;

export default async function HomePage() {
  const [categories, homepageTools, todayFeed, featuredStacks] = await Promise.all([
    getPublicCategories(),
    getHomepageTools(),
    getTodayToolsFeedCached(),
    getFeaturedStackPreviews()
  ]);

  const totalTools = categories.reduce((sum, category) => sum + category.toolCount, 0);
  const trendingNames = homepageTools.trending.map((tool) => tool.name).slice(0, 4);
  const popularCategories = [...categories].sort((left, right) => right.toolCount - left.toolCount).slice(0, 8);
  const popularPrompts = getPopularPrompts(3);
  const popularWorkflows = workflows.slice(0, 3);
  const dailyTools = todayFeed.todayNew.length ? todayFeed.todayNew.slice(0, 3) : todayFeed.trendingToday.slice(0, 3);
  const todaySignalCount = todayFeed.todayNew.length + todayFeed.trendingToday.length + todayFeed.editorPicks.length;
  const freeToolRoutes = [
    {
      href: "/seo-tools",
      title: "Grow my website",
      description:
        "Use free SEO tools for keyword research, technical audits, title rewrites, meta descriptions, and CTR improvements before you invest in a larger stack."
    },
    {
      href: "/pdf-tools",
      title: "Fix my PDF",
      description:
        "Find fast PDF tools to compress, merge, split, convert, and prepare documents for clients, lead magnets, reports, and internal workflows."
    },
    {
      href: "/image-tools",
      title: "Edit an image fast",
      description:
        "Discover free image tools for compression, resizing, format conversion, background cleanup, AI visuals, and web-ready creative assets."
    }
  ];
  const audienceCards: AudienceCard[] = [
    {
      eyebrow: "For buyers",
      title: "Turn AI research into a shortlist you can defend.",
      description:
        "Use workflow-first search, comparison pages, and daily movement signals to cut through hype before you commit time or budget.",
      href: "/find-ai-tool",
      cta: "Start with AI Finder",
      bullets: [
        "Search by use case instead of product recall",
        "Compare similar tools before your team commits",
        "Track what is rising without scanning five sites"
      ],
      icon: BrainCircuit
    },
    {
      eyebrow: "For founders",
      title: "Get discovered in context, not buried in noise.",
      description:
        "Submission, featured placement, SEO pages, and comparison routes create more qualified discovery than a plain paid listing.",
      href: "/submit",
      cta: "Submit your tool",
      bullets: [
        "Reach buyers inside category and workflow pages",
        "Feature products without breaking trust",
        "Show up in comparison and daily signal surfaces"
      ],
      icon: Sparkles
    }
  ];
  const operatingLoop = [
    {
      step: "01",
      title: "Start with the workflow",
      description: "Visitors begin with the job to be done, not a random brand they already know."
    },
    {
      step: "02",
      title: "Compare contenders",
      description: "The product routes users into related tools, prompts, and comparison pages with more context."
    },
    {
      step: "03",
      title: "Watch live movement",
      description: "Daily market signals keep the catalog fresh enough to earn return visits."
    },
    {
      step: "04",
      title: "Build a stack",
      description: "Winning tools become part of a reusable workflow instead of a one-off experiment."
    }
  ];

  const decisionRoutes: RouteCard[] = [
    {
      title: "Describe the workflow",
      description: "Use plain language and let the product infer the strongest tools instead of guessing categories first.",
      href: "/find-ai-tool",
      metric: "Natural-language matching",
      icon: BrainCircuit
    },
    {
      title: "Catch what moved today",
      description: "Review new listings, rising tools, and editor picks before they become crowded discovery channels.",
      href: "/today-ai-tools",
      metric: `${compactNumber(todaySignalCount)} fresh signals`,
      icon: Flame
    },
    {
      title: "Copy proven systems",
      description: "Browse repeatable workflows so visitors understand how tools fit together in real production setups.",
      href: "/workflows",
      metric: `${compactNumber(workflows.length)} workflow breakdowns`,
      icon: Workflow
    },
    {
      title: "Build a reusable stack",
      description: "Move from isolated product pages into tool combinations that match a team, role, or growth objective.",
      href: "/my-stack",
      metric: `${compactNumber(featuredStacks.length)} starter stacks`,
      icon: Blocks
    }
  ];

  const platformAdvantages: AdvantageCard[] = [
    {
      title: "Signal-first ranking",
      description: "Trending surfaces combine views, favorites, and recent activity so the catalog behaves like a living market, not a static list.",
      icon: Radar
    },
    {
      title: "Internal linking that earns traffic",
      description: "High-intent landing pages, categories, workflows, prompts, and stacks create more entry points for search and referrals.",
      icon: BarChart3
    },
    {
      title: "Moderation that keeps the catalog usable",
      description: "Submissions route through review before they reach public pages, which protects quality as the inventory grows.",
      icon: BadgeCheck
    },
    {
      title: "Monetization without cheapening discovery",
      description: "Featured placement exists inside the same information architecture, so promotion feels premium instead of intrusive.",
      icon: Sparkles
    }
  ];

  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": absoluteUrl("/#trending-tools"),
        name: "Trending AI Tools",
        itemListElement: homepageTools.trending.slice(0, 6).map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: absoluteUrl(`/tools/${tool.slug}`)
        }))
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl("/#homepage-faq"),
        mainEntity: faqEntries.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer
          }
        }))
      },
      {
        "@type": "WebPage",
        "@id": absoluteUrl("/#homepage"),
        name: "Tools Finder Homepage",
        url: absoluteUrl("/"),
        description:
          "A workflow-first discovery hub for AI, SEO, PDF, and image tools with comparison routes and daily movement signals.",
        about: {
          "@type": "Thing",
          name: "Workflow-first tool discovery"
        },
        mainEntity: {
          "@id": absoluteUrl("/#tool-fit-framework")
        }
      },
      {
        "@type": "DefinedTermSet",
        "@id": absoluteUrl("/#tool-fit-framework"),
        name: "Tool Fit Score Framework",
        description:
          "A four-signal methodology used to evaluate whether a tool is practically useful for a specific workflow.",
        hasDefinedTerm: toolFitPillars.map((pillar) => ({
          "@type": "DefinedTerm",
          name: pillar.title,
          description: pillar.detail
        }))
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageStructuredData) }}
      />

      <HeroSection
        totalTools={totalTools}
        totalCategories={categories.length}
        featuredCount={homepageTools.featured.length}
        trendingTools={trendingNames}
        popularCategories={popularCategories.slice(0, 4).map((category) => category.name)}
        dailyCount={todaySignalCount}
      />

      <section className="page-frame py-4 md:py-8">
        <div className="section-shell p-7 md:p-9">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Free online tools</p>
          <div className="mt-4 grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-start">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight md:text-5xl">
                Best free online tools for SEO, PDF, image, and AI workflows in 2026.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                Tools Finder helps you move from a vague search result to the right browser-based tool faster. Instead of opening five tabs and testing random apps, start with focused routes for free online tools that solve common work problems: SEO tools for better rankings and click-through rates, PDF tools for cleaner documents, image tools for lighter visual assets, and AI tools for research, content, coding, design, and marketing workflows.
              </p>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                The goal is simple: fast results, clear comparisons, and no unnecessary signup friction when the job should be instant. Use the homepage when you want the best free online tools in one place, then move into a dedicated page when you already know the task. Each route links back into the broader directory so you can compare free, freemium, and premium options without losing context.
              </p>
            </div>
            <div className="grid gap-4">
              {freeToolRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="interactive-panel rounded-[1.35rem] border border-border/70 bg-white/78 p-5 shadow-sm"
                >
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">{route.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{route.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-foreground">
                    Show tools
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[1.35rem] border border-border/70 bg-background/55 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
                Why no-signup tools win
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Many tasks should take seconds: compress an image, check a title tag, merge a PDF, or find a better writing assistant. No-signup tools reduce friction and help visitors finish the job before comparing deeper alternatives.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-background/55 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
                Built for search intent
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The homepage now makes the main topics explicit: free online tools, SEO tools, PDF tools, image tools, and AI discovery. That structure gives users and search crawlers clearer topical paths.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-border/70 bg-background/55 p-5">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">
                Compare before you commit
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                When a basic tool is not enough, the directory helps you compare alternatives by category, pricing, tags, popularity, and workflow fit, so the next click is still useful.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-frame py-4 md:py-8">
        <SectionHeading
          eyebrow="Positioning"
          title="Built for both sides of the AI discovery market."
          description="Buyers need faster decisions. Founders need qualified visibility. The product should make both loops obvious."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {audienceCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="section-shell inner-glow p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                      {card.eyebrow}
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
                      {card.title}
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{card.description}</p>
                <div className="mt-6 space-y-3">
                  {card.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[1.1rem] border border-border/70 bg-white/75 px-4 py-3 text-sm font-medium text-foreground"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
                <Button asChild className="mt-6">
                  <Link href={card.href}>
                    {card.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-frame py-4 md:py-8">
        <SectionHeading
          eyebrow="Command center"
          title="Give visitors more than a catalog."
          description="These entry points turn passive browsing into faster discovery, deeper engagement, and stronger multi-page sessions."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {decisionRoutes.map((route) => {
            const Icon = route.icon;

            return (
              <Link
                key={route.href}
                href={route.href}
                className="interactive-panel section-shell inner-glow block h-full p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                  {route.metric}
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
                  {route.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{route.description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-foreground">
                  Start workflow
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Decision loop"
          title="A stronger path than browse, bounce, and forget."
          description="The homepage now frames the product as a sequence: understand the workflow, compare candidates, watch movement, and build a usable stack."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {operatingLoop.map((item) => (
            <div key={item.step} className="section-shell p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">{item.step}</p>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Popular categories"
          title="Start with the busiest AI workflows."
          description="Jump into the categories with the strongest catalog depth to compare tools faster."
          action={
            <Button asChild variant="outline">
              <Link href="/categories">All categories</Link>
            </Button>
          }
        />
        <div className="mt-8">
          <CategoryGrid categories={popularCategories} />
        </div>
      </section>

      <section className="page-frame py-4 md:py-8">
        <SectionHeading
          eyebrow="Collections"
          title="Curated discovery for specific audiences."
          description="Jump straight into tailored shortlists for students, developers, and designers without rebuilding the full query from scratch."
          action={
            <Button asChild variant="outline">
              <Link href="/tools">Browse full directory</Link>
            </Button>
          }
        />
        <div className="mt-8">
          <CollectionGrid collections={toolCollections} />
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Growth pages"
          title="High-intent landing pages that bring in better traffic."
          description="These pages give the site more surface area for search, social shares, and specific job-to-be-done intent without bloating the main directory."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {landingRoutes.map((route) => (
            <Link key={route.href} href={route.href} className="interactive-panel section-shell block h-full p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">SEO route</p>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
                {route.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{route.description}</p>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-foreground">
                View details
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-frame py-6 md:py-10">
        <div className="grid gap-5 lg:grid-cols-4">
          {platformAdvantages.map((advantage) => {
            const Icon = advantage.icon;

            return (
              <div key={advantage.title} className="section-shell inner-glow p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                  {advantage.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{advantage.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="page-frame py-4 md:py-8">
        <SectionHeading
          eyebrow="Shortcut"
          title="Not sure where to start?"
          description="Use the AI tool finder to describe the job in plain language and get a ranked shortlist instead of guessing categories first."
          action={
            <Button asChild>
              <Link href="/find-ai-tool">Get recommendations</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="section-shell hero-mesh p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">AI tool finder</p>
            <h3 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              Describe the workflow. Let the platform infer the tools.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Ask for help with research summaries, YouTube thumbnails, coding copilots, marketing copy, or design workflows and get recommendations backed by directory metadata.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/find-ai-tool">Find my tool</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tools">Browse categories</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Natural-language search",
                "Category and tag inference",
                "Faster path to comparison pages"
              ].map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-white/80 bg-white/78 px-4 py-4 text-sm font-medium text-foreground shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="section-shell p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Example queries</p>
            <div className="mt-5 space-y-3">
              {[
                "I need an AI tool for YouTube thumbnails",
                "Recommend an AI coding assistant for debugging",
                "Find me a tool for research summaries"
              ].map((query) => (
                <Link
                  key={query}
                  href={`/find-ai-tool?q=${encodeURIComponent(query)}`}
                  className="interactive-panel block rounded-[1.2rem] border border-border/70 bg-white/75 px-4 py-4 text-sm font-medium text-foreground hover:bg-white"
                >
                  {query}
                </Link>
              ))}
            </div>
            <div className="mt-6 rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">What users get</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <li>Ranked suggestions matched to the workflow, not just the keyword.</li>
                <li>Cleaner starting points before browsing full categories.</li>
                <li>More intent-rich traffic flowing deeper into the directory.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ToolSection
        eyebrow="Trending now"
        title="Trending AI Tools"
        description="The fastest-rising tools based on recent views, favorites, and live discovery activity."
        tools={homepageTools.trending}
      />

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Daily AI tools"
          title="What moved today."
          description="A daily snapshot of new listings, rising tools, and editor-selected standouts."
          action={
            <Button asChild variant="outline">
              <Link href="/today-ai-tools">View details</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {dailyTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <ToolSection
        eyebrow="Newly added"
        title="Newly Added Tools"
        description="Fresh additions to the directory, ready for early discovery before the rest of the market catches up."
        tools={homepageTools.latest}
      />

      <ToolSection
        eyebrow="Featured"
        title="Featured Tools"
        description="Premium placements for teams promoting standout products inside the highest-intent discovery surfaces."
        tools={homepageTools.featured}
      />

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Workflows"
          title="Popular workflows"
          description="See how real teams combine tools into repeatable AI workflows instead of using each product in isolation."
          action={
            <Button asChild variant="outline">
              <Link href="/workflows">All workflows</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {popularWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.slug} workflow={workflow} />
          ))}
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="My stack"
          title="Featured stacks"
          description="Starter stacks that show how strong AI tools can fit together around a focused workflow."
          action={
            <Button asChild variant="outline">
              <Link href="/my-stack">Build my stack</Link>
            </Button>
          }
        />
        <div className="mt-8">
          <FeaturedStackGrid stacks={featuredStacks} />
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Popular prompts"
          title="Copyable prompts that make tools more useful."
          description="A prompt library for the most popular AI tools, with reusable starting points for real workflows."
          action={
            <Button asChild variant="outline">
              <Link href="/prompts">View prompt library</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {popularPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="Unique framework"
          title="Tool Fit Score: how we separate useful tools from noise."
          description="Most directories stop at categories. Tools Finder adds a four-signal framework so visitors can decide faster with less trial and error."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {toolFitPillars.map((pillar, index) => (
            <div key={pillar.title} className="section-shell p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                Signal {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions serious visitors usually ask before they commit."
          description="Answering these directly helps both conversion quality and search visibility for the homepage."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {faqEntries.map((entry) => (
            <div key={entry.question} className="section-shell p-6">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
                {entry.question}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-frame py-10 md:py-14">
        <NewsletterForm
          source="homepage"
          title="Get the weekly AI tools brief before the market catches up."
          description="One high-signal email with trending tools, new launches, prompt packs, workflow breakdowns, and comparison pages worth reading."
          buttonLabel="Subscribe free"
        />
      </section>
    </>
  );
}
