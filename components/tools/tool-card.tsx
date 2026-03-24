import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Eye, Heart, Star } from "lucide-react";
import type { Tool } from "@/types";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { SmoothImage } from "@/components/shared/smooth-image";
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
    <MotionReveal
      className="h-full"
      y={18}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.995 }}
    >
      <Card className="group surface-card-hover flex h-full flex-col overflow-hidden border-white/75 bg-white/88">
        <CardHeader className="relative flex flex-row items-start justify-between gap-4 border-b border-border/70 bg-gradient-to-br from-white via-white to-background/70">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-secondary via-primary/70 to-accent" />
          <div className="flex min-w-0 gap-4">
            {tool.logo ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.15rem] border border-white/80 bg-white/92 shadow-sm transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] group-hover:shadow-premium">
                <SmoothImage
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  fill
                  fadeDurationMs={420}
                  sizes="56px"
                  className="object-contain p-2.5"
                />
              </div>
            ) : (
              <div
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-[1.15rem] bg-gradient-to-br ${tool.logoBackground} font-[family-name:var(--font-heading)] text-lg font-bold text-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]`}
              >
                {tool.logoText}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/categories/${tool.categorySlug}`} className="inline-flex">
                  <Badge
                    variant="muted"
                    className="interactive-chip border border-border/70 bg-white/82 hover:bg-primary hover:text-primary-foreground"
                  >
                    {tool.category}
                  </Badge>
                </Link>
                <Badge variant={tool.featured ? "accent" : "default"}>{tool.pricing}</Badge>
              </div>
              <p className="mt-3 truncate text-sm text-muted-foreground">{getHostnameLabel(tool.website)}</p>
            </div>
          </div>
          {tool.featured ? <Badge variant="accent">Featured</Badge> : null}
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <CardTitle className="mt-4 transition-colors duration-200 group-hover:text-primary">
            <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
          </CardTitle>
          <CardDescription className="mt-2 text-base text-foreground/80">{tool.tagline}</CardDescription>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{tool.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {tool.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/tools?tag=${encodeURIComponent(tag)}`} className="inline-flex">
                <Badge
                  variant="muted"
                  className="interactive-chip border border-border/70 bg-white/80 hover:bg-primary hover:text-primary-foreground"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex-col items-stretch gap-4 border-t border-border/70 bg-background/45">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: <Star className="h-3.5 w-3.5" />,
                label: "Rating",
                value: tool.rating.toFixed(1),
                detail: `${compactNumber(tool.reviewCount)} reviews`
              },
              {
                icon: <Heart className="h-3.5 w-3.5" />,
                label: "Saves",
                value: compactNumber(tool.favoritesCount),
                detail: `Score ${tool.trendingScore.toFixed(1)}`
              },
              {
                icon: <Eye className="h-3.5 w-3.5" />,
                label: "Views",
                value: compactNumber(tool.viewsCount),
                detail: `Added ${formatRelativeDate(tool.createdAt)}`
              }
            ].map((metric) => (
              <div key={metric.label} className="rounded-[1.2rem] border border-white/80 bg-white/78 px-3 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-primary">
                  {metric.icon}
                  <span>{metric.label}</span>
                </div>
                <div className="mt-2 text-base font-semibold text-foreground">{metric.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{metric.detail}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            {action ? <div className="shrink-0">{action}</div> : <div />}
            <Button asChild variant="outline" size="sm" className="group/button">
              <Link href={`/tools/${tool.slug}`}>
                View details
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </MotionReveal>
  );
}
