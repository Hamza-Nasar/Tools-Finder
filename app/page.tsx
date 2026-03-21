import Link from "next/link";
import { getPublicCategories } from "@/lib/data/categories";
import { getHomepageTools, getTodayToolsFeedCached } from "@/lib/data/tools";
import { getFeaturedStackPreviews } from "@/lib/data/stacks";
import { toolCollections } from "@/lib/collections";
import { getPopularPrompts } from "@/lib/prompt-library";
import { workflows } from "@/lib/workflows";
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

  return (
    <>
      <HeroSection
        totalTools={totalTools}
        totalCategories={categories.length}
        featuredCount={homepageTools.featured.length}
        trendingTools={trendingNames}
      />

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

      <section className="page-frame py-6 md:py-10">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="surface-card surface-card-hover p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Searchable</p>
            <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold">
              Filter by workflow, tag, and relevance.
            </h3>
            <p className="mt-3 text-muted-foreground">
              Every directory view is URL-addressable, paginated, and ready for search-driven landing pages.
            </p>
          </div>
          <div className="surface-card surface-card-hover p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Curated</p>
            <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold">
              Moderated submissions keep the catalog useful.
            </h3>
            <p className="mt-3 text-muted-foreground">
              New tools enter a review queue before they appear publicly, so the directory stays navigable as it grows.
            </p>
          </div>
          <div className="surface-card surface-card-hover p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Monetizable</p>
            <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold">
              Featured placement is built into the ranking model.
            </h3>
            <p className="mt-3 text-muted-foreground">
              Featured tools rise on the homepage and category surfaces without forking the product experience.
            </p>
          </div>
        </div>
      </section>

      <section className="page-frame py-4 md:py-8">
        <SectionHeading
          eyebrow="Shortcut"
          title="Not sure where to start?"
          description="Use the AI tool finder to describe the job in plain language and get a ranked shortlist instead of guessing categories first."
          action={
            <Button asChild>
              <Link href="/find-ai-tool">Open AI tool finder</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card hero-mesh p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">AI tool finder</p>
            <h3 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              Describe the workflow. Let the platform infer the tools.
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Ask for help with research summaries, YouTube thumbnails, coding copilots, marketing copy, or design workflows and get recommendations backed by directory metadata.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/find-ai-tool">Try the recommender</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tools">Browse manually</Link>
              </Button>
            </div>
          </div>
          <div className="surface-card p-6">
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
                  className="block rounded-[1.2rem] border border-border/70 bg-white/75 px-4 py-4 text-sm font-medium text-foreground transition hover:-translate-y-0.5 hover:bg-white"
                >
                  {query}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ToolSection
        eyebrow="🔥 Trending"
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
              <Link href="/today-ai-tools">Open daily feed</Link>
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
              <Link href="/prompts">Open prompt library</Link>
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
