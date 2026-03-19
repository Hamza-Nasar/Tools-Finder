import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import type { SeoLandingConfig } from "@/lib/seo-landings";
import type { Tool } from "@/types";
import { PageHero } from "@/components/shared/page-hero";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";

export function SeoLandingPage({
  config,
  tools
}: {
  config: SeoLandingConfig;
  tools: Tool[];
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.title,
    description: config.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/tools/${tool.slug}`),
        name: tool.name
      }))
    }
  };

  return (
    <div className="page-frame py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        eyebrow={config.eyebrow}
        title={config.heading}
        description={config.intro}
        actions={
          <>
            <Button asChild>
              <Link href="/tools">Browse full directory</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/submit">Submit a tool</Link>
            </Button>
          </>
        }
        stats={[
          { label: "Live results", value: String(tools.length), detail: "pulled directly from the catalog" },
          {
            label: "Ranking mode",
            value: config.query.sort === "featured" ? "Featured" : "Popular",
            detail: "optimized for search intent and discovery"
          },
          { label: "SEO status", value: "Indexed", detail: "ready for sitemap and search crawler coverage" }
        ]}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">About this page</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{config.description}</p>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">How this list updates</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Results are pulled dynamically from the live directory, so the page stays aligned with
              current ranking signals, moderation decisions, featured placements, and category changes.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
