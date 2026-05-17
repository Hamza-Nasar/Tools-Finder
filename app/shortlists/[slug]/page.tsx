import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { ShortlistService } from "@/lib/services/shortlist-service";
import { PageHero } from "@/components/shared/page-hero";
import { ToolCard } from "@/components/tools/tool-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Shared shortlist",
  description: "A shared tool shortlist generated from workflow intent.",
  path: "/shortlists",
  noIndex: true
});

export default async function SharedShortlistPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shortlist = await ShortlistService.getByShareSlug(slug);

  if (!shortlist) {
    notFound();
  }

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Shared shortlist"
        title={shortlist.name}
        description={shortlist.query}
        stats={[
          { label: "Tools", value: String(shortlist.tools.length), detail: "saved in this shortlist" },
          { label: "Updated", value: new Date(shortlist.updatedAt).toLocaleDateString(), detail: "latest snapshot" }
        ]}
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {shortlist.inferredCategories.map((value) => (
          <Badge key={value} variant="muted">{value}</Badge>
        ))}
        {shortlist.inferredTags.map((value) => (
          <Badge key={value} variant="muted">{value}</Badge>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {shortlist.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <div className="mt-8">
        <Button asChild>
          <Link href="/find-ai-tool">Create your own shortlist</Link>
        </Button>
      </div>
    </div>
  );
}
