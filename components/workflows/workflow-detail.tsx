import Link from "next/link";
import type { Tool, Workflow } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkflowDetail({
  workflow,
  tools
}: {
  workflow: Workflow;
  tools: Tool[];
}) {
  const toolsBySlug = new Map(tools.map((tool) => [tool.slug, tool]));

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle>Workflow overview</CardTitle>
            <CardDescription>{workflow.outcome}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {workflow.steps.map((step, index) => (
              <div key={step.title} className="flex gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/12 font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.toolSlugs.map((slug) => {
                      const tool = toolsBySlug.get(slug);

                      return tool ? (
                        <Link key={slug} href={`/tools/${slug}`}>
                          <Badge variant="muted" className="transition hover:bg-primary hover:text-primary-foreground">
                            {tool.name}
                          </Badge>
                        </Link>
                      ) : (
                        <Badge key={slug} variant="muted">
                          {slug}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle>Tools used</CardTitle>
            <CardDescription>The stack this workflow is built around.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="block rounded-[1.35rem] border border-border/70 bg-background/52 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/82 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{tool.name}</p>
                  <Badge variant={tool.featured ? "accent" : "default"}>{tool.pricing}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tool.tagline}</p>
              </Link>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/my-stack">Add tools to my stack</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
