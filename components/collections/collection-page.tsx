import Link from "next/link";
import type { Tool } from "@/types";
import type { ToolCollectionDefinition } from "@/lib/collections";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";

export function CollectionPage({
  collection,
  tools
}: {
  collection: ToolCollectionDefinition;
  tools: Tool[];
}) {
  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow={collection.eyebrow}
        title={collection.title}
        description={collection.description}
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
          {
            label: "Tools surfaced",
            value: String(tools.length),
            detail: "ranked by relevance, popularity, and current discovery signals"
          },
          {
            label: "Audience",
            value: collection.title.replace(/^AI Tools for /, ""),
            detail: "curated to match a focused use case"
          }
        ]}
      />

      <div className="mt-10">
        {tools.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Collection"
            title="No tools match this collection yet"
            description="The page is ready, but the current catalog does not have enough matching tools for this theme."
            ctaHref="/tools"
            ctaLabel="Explore the directory"
          />
        )}
      </div>
    </div>
  );
}
