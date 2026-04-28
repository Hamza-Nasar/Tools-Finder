import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteSearchResult } from "@/lib/site-search";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SiteSearchResults({
  query,
  results
}: {
  query: string;
  results: SiteSearchResult[];
}) {
  if (!results.length) {
    return null;
  }

  return (
    <section>
      <SectionHeading
        eyebrow="Overall search"
        title="Best matches across Tools Finder"
        description={`Pages, guides, and hubs that match "${query}" before the MongoDB catalog is shown.`}
      />
      <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {results.map((result, index) => (
          <MotionReveal key={result.id} className="h-full" delay={index * 0.04} y={16}>
            <Link href={result.href} className="block h-full">
              <Card className="group surface-card-hover h-full overflow-hidden">
                <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-secondary/25">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{result.type}</Badge>
                    <Badge variant="muted">Site match</Badge>
                  </div>
                  <CardTitle className="mt-3 transition-colors duration-200 group-hover:text-primary">
                    {result.title}
                  </CardTitle>
                  <CardDescription className="mt-2">{result.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 pt-6">
                  <span className="text-sm font-medium text-primary">Open result</span>
                  <span className="inline-flex items-center text-sm text-muted-foreground transition group-hover:text-foreground">
                    View page
                    <ArrowUpRight data-icon="inline-end" className="ml-2 size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
