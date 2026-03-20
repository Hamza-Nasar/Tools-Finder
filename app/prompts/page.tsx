import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getPopularPrompts, getPromptToolGroups } from "@/lib/prompt-library";
import { PromptCard } from "@/components/prompts/prompt-card";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "AI Prompt Library",
  description: "Browse reusable prompts for ChatGPT, Claude, Midjourney, GitHub Copilot, and more.",
  path: "/prompts",
  keywords: ["ai prompts", "chatgpt prompts", "midjourney prompts", "prompt library"]
});

export default function PromptsPage() {
  const promptGroups = getPromptToolGroups();
  const popularPrompts = getPopularPrompts(4);

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Prompt library"
        title="Reusable prompts for your favorite AI tools."
        description="A curated prompt directory for writing, research, design, coding, and productivity workflows."
        actions={
          <Button asChild>
            <Link href="/tools">Browse tools</Link>
          </Button>
        }
        stats={[
          { label: "Tools covered", value: String(promptGroups.length), detail: "prompt packs grouped by tool" },
          { label: "Prompt packs", value: String(popularPrompts.length), detail: "featured prompts ready to copy" }
        ]}
      />

      <section className="mt-10">
        <SectionHeading
          eyebrow="Popular prompts"
          title="Start with the prompts people reuse most."
          description="High-signal prompt templates for common AI workflows."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {popularPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Browse by tool"
          title="Tool-specific prompt packs."
          description="Open a dedicated prompt page for each AI tool and keep similar workflows grouped together."
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {promptGroups.map((group) => (
            <Link key={group.slug} href={`/prompts/${group.slug}`}>
              <Card className="group surface-card-hover h-full overflow-hidden">
                <CardHeader className="border-b border-border/60 bg-gradient-to-br from-white via-white to-background/70">
                  <CardTitle>{group.toolName}</CardTitle>
                  <CardDescription className="mt-2">{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 pt-6">
                  <span className="text-sm font-medium text-primary">{group.promptCount} prompts</span>
                  <span className="text-sm text-muted-foreground transition group-hover:text-foreground">Open</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
