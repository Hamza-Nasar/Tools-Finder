import { notFound } from "next/navigation";
import { getRelatedToolsCached, getToolBySlugCached } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { ToolComparison } from "@/components/tools/tool-comparison";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function parseComparisonSlug(slug: string) {
  const separator = "-vs-";
  const index = slug.indexOf(separator);

  if (index <= 0 || index >= slug.length - separator.length) {
    return null;
  }

  return {
    toolASlug: slug.slice(0, index),
    toolBSlug: slug.slice(index + separator.length)
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = parseComparisonSlug((await params).slug);

  if (!resolved) {
    return buildMetadata({
      title: "Tool comparison",
      description: "Compare AI tools side by side."
    });
  }

  try {
    const [toolA, toolB] = await Promise.all([
      getToolBySlugCached(resolved.toolASlug),
      getToolBySlugCached(resolved.toolBSlug)
    ]);

    return buildMetadata({
      title: `${toolA.name} vs ${toolB.name}`,
      description: `Compare ${toolA.name} vs ${toolB.name} across pricing, category fit, popularity, and overall discovery signals.`,
      path: `/compare/${resolved.toolASlug}-vs-${resolved.toolBSlug}`,
      keywords: [`${toolA.name} vs ${toolB.name}`, toolA.category, toolB.category, ...toolA.tags.slice(0, 3)]
    });
  } catch {
    return buildMetadata({
      title: "Tool comparison",
      description: "Compare AI tools side by side."
    });
  }
}

export default async function ToolComparisonPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = parseComparisonSlug((await params).slug);

  if (!resolved || resolved.toolASlug === resolved.toolBSlug) {
    notFound();
  }

  try {
    const [toolA, toolB] = await Promise.all([
      getToolBySlugCached(resolved.toolASlug),
      getToolBySlugCached(resolved.toolBSlug)
    ]);
    const alternatives = await getRelatedToolsCached({
      slug: toolA.slug,
      categorySlug: toolA.categorySlug,
      tags: [...toolA.tags, ...toolB.tags],
      limit: 4
    });

    return (
      <div className="page-frame py-12">
        <PageHero
          eyebrow="Comparison"
          title={`${toolA.name} vs ${toolB.name}`}
          description={`A side-by-side comparison of ${toolA.name} and ${toolB.name} across category fit, pricing, popularity, and the signals buyers care about most.`}
          stats={[
            { label: toolA.name, value: toolA.pricing, detail: `${toolA.category} workflow` },
            { label: toolB.name, value: toolB.pricing, detail: `${toolB.category} workflow` }
          ]}
        />

        <div className="mt-10">
          <ToolComparison toolA={toolA} toolB={toolB} />
        </div>

        <div className="mt-10">
          {alternatives.length ? (
            <div className="surface-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Next step</p>
                <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                  Need a wider comparison set?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  Explore alternatives and adjacent tools from the same workflow to compare more than just this pair.
                </p>
              </div>
              <Button asChild>
                <Link href={`/alternatives/${toolA.slug}`}>See more {toolA.name} alternatives</Link>
              </Button>
            </div>
          ) : (
            <EmptyState
              label="Comparison"
              title="This pair is ready to compare"
              description="As more tools with similar categories and tags are indexed, broader alternatives will appear automatically."
              ctaHref={`/categories/${toolA.categorySlug}`}
              ctaLabel={`Browse ${toolA.category} tools`}
            />
          )}
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
