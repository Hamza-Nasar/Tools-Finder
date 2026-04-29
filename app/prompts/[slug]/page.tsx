import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getPromptToolGroup } from "@/lib/prompt-library";
import { PromptCard } from "@/components/prompts/prompt-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const group = getPromptToolGroup((await params).slug);

  if (!group) {
    return buildMetadata({
      title: "Prompt pack not found",
      description: "The requested prompt pack could not be found."
    });
  }

  return buildMetadata({
    title: `${group.toolName} prompts`,
    description: `Copy-ready ${group.toolName} prompts for common workflows and use cases.`,
    path: `/prompts/${group.slug}`,
    keywords: [`${group.toolName} prompts`, "ai prompts", "prompt templates"]
  });
}

export default async function PromptToolPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const group = getPromptToolGroup((await params).slug);

  if (!group) {
    notFound();
  }

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Prompt pack"
        title={`${group.toolName} prompts`}
        description={group.description}
        actions={
          <>
            <Button asChild>
              <Link href="/prompts">View prompt library</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/tools?q=${encodeURIComponent(group.toolName)}`}>Find my tool</Link>
            </Button>
          </>
        }
        stats={[
          { label: "Prompts", value: String(group.promptCount), detail: "copy-ready prompt templates" }
        ]}
      />

      <div className="mt-10">
        {group.prompts.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {group.prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Prompts"
            title="No prompts are available for this tool yet"
            description="This prompt page is ready, but it has not been populated with reusable templates."
            ctaHref="/prompts"
            ctaLabel="Back to prompt library"
          />
        )}
      </div>
    </div>
  );
}
