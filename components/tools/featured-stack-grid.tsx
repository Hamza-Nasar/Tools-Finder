import Link from "next/link";
import type { FeaturedStackPreview } from "@/lib/data/stacks";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FeaturedStackGrid({ stacks }: { stacks: FeaturedStackPreview[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {stacks.map((stack, index) => (
        <MotionReveal key={stack.slug} className="h-full" delay={index * 0.05} y={16}>
          <Card className="surface-card-hover h-full overflow-hidden">
            <CardHeader className="border-b border-border/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{stack.audience}</p>
              <CardTitle className="mt-3">{stack.title}</CardTitle>
              <CardDescription className="mt-2">{stack.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-6">
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
        </MotionReveal>
      ))}
    </div>
  );
}
