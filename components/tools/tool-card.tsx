import Link from "next/link";
import type { ReactNode } from "react";
import type { Tool } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { compactNumber, formatRelativeDate, getHostnameLabel } from "@/lib/utils";

export function ToolCard({
  tool,
  action
}: {
  tool: Tool;
  action?: ReactNode;
}) {
  return (
    <Card className="group surface-card-hover flex h-full flex-col overflow-hidden">
      <CardHeader className="relative flex flex-row items-start justify-between gap-4 border-b border-border/70 bg-gradient-to-br from-white via-white to-background/70">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary/70 to-accent" />
        <div className="flex gap-4">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-[1.15rem] bg-gradient-to-br ${tool.logoBackground} font-[family-name:var(--font-heading)] text-lg font-bold text-white shadow-sm`}
          >
            {tool.logoText}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">{tool.category}</Badge>
              <Badge variant={tool.featured ? "accent" : "default"}>{tool.pricing}</Badge>
            </div>
            <p className="mt-3 truncate text-sm text-muted-foreground">{getHostnameLabel(tool.website)}</p>
          </div>
        </div>
        {tool.featured ? <Badge variant="accent">Featured</Badge> : null}
      </CardHeader>
      <CardContent className="flex-1">
        <CardTitle className="mt-4">{tool.name}</CardTitle>
        <CardDescription className="mt-2 text-base text-foreground/80">{tool.tagline}</CardDescription>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{tool.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-4 border-t border-border/70 bg-background/45">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">{tool.rating.toFixed(1)}</span> rating
            <div>{compactNumber(tool.reviewCount)} reviews</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-foreground">{compactNumber(tool.favoritesCount)} saves</div>
            <div>{compactNumber(tool.viewsCount)} visits</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span>Added {formatRelativeDate(tool.createdAt)}</span>
          <span>Score {tool.trendingScore.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          {action ? <div className="shrink-0">{action}</div> : <div />}
          <Button asChild variant="outline" size="sm">
            <Link href={`/tools/${tool.slug}`}>View details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
