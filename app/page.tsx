import Link from "next/link";
import { getPublicCategories } from "@/lib/data/categories";
import { getHomepageTools } from "@/lib/data/tools";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { HeroSection } from "@/components/marketing/hero-section";
import { ToolSection } from "@/components/marketing/tool-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [categories, homepageTools] = await Promise.all([getPublicCategories(), getHomepageTools()]);
  const totalTools = categories.reduce((sum, category) => sum + category.toolCount, 0);
  const trendingNames = homepageTools.trending.map((tool) => tool.name).slice(0, 4);

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
          eyebrow="Browse by category"
          title="Explore the AI landscape faster."
          description="Start with a focused category page to compare tools in the exact workflow you care about."
          action={
            <Button asChild variant="outline">
              <Link href="/categories">All categories</Link>
            </Button>
          }
        />
        <div className="mt-8">
          <CategoryGrid categories={categories} />
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

      <ToolSection
        eyebrow="Featured"
        title="Priority placements for standout tools."
        description="Featured listings are reserved for products promoted through the paid spotlight workflow."
        tools={homepageTools.featured}
      />

      <ToolSection
        eyebrow="Trending"
        title="What users are discovering right now."
        description="Trending rankings are backed by indexed database reads and popularity metadata prepared for a larger catalog."
        tools={homepageTools.trending}
      />

      <ToolSection
        eyebrow="Latest"
        title="Freshly added tools"
        description="A rolling feed of newly indexed AI products across research, productivity, video, coding, and more."
        tools={homepageTools.latest}
      />
    </>
  );
}
