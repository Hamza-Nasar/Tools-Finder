import Link from "next/link";
import type { FeaturedStackPreview } from "@/lib/data/stacks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturedStackGrid({ stacks }: { stacks: FeaturedStackPreview[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {stacks.map((stack) => (
        <Card key={stack.slug} className="surface-card-hover h-full overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{stack.audience}</p>
            <CardTitle className="mt-3">{stack.title}</CardTitle>
            <CardDescription className="mt-2">{stack.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex flex-wrap gap-2">
              {stack.tools.length
                ? stack.tools.map((tool) => (
                    <Badge key={tool.id} variant="muted" className="interactive-chip">
                      {tool.name}
                    </Badge>
                  ))
                : stack.toolSlugs.map((slug) => (
                    <Badge key={slug} variant="muted" className="interactive-chip">
                      {slug}
                    </Badge>
                  ))}
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/my-stack">Build my stack</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
