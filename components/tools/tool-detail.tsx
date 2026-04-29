import Link from "next/link";
import type { ReactNode } from "react";
import type { Tool } from "@/types";
import { SmoothImage } from "@/components/shared/smooth-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackedCompareLink } from "@/components/tools/tracked-compare-link";
import { compactNumber, formatRelativeDate, getHostnameLabel } from "@/lib/utils";

export function ToolDetail({
  tool,
  relatedTools,
  comparisonTools,
  workflowsUsingTool,
  action
}: {
  tool: Tool;
  relatedTools: Tool[];
  comparisonTools: Tool[];
  workflowsUsingTool: Array<{ slug: string; title: string; description: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="page-frame py-12">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-8">
          <Card className="overflow-hidden shadow-glow">
            <CardHeader className="hero-mesh relative overflow-hidden border-b border-border/70">
              <div className="absolute -left-10 top-16 h-32 w-32 rounded-full bg-secondary/45 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  {tool.logo ? (
                    <div className="overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/90 p-2 shadow-sm">
                      <SmoothImage
                        src={tool.logo}
                        alt={`${tool.name} logo`}
                        width={72}
                        height={72}
                        className="h-16 w-16 rounded-2xl object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      className={`grid h-16 w-16 place-items-center rounded-[1.6rem] bg-gradient-to-br ${tool.logoBackground} font-[family-name:var(--font-heading)] text-xl font-bold text-white shadow-sm`}
                    >
                      {tool.logoText}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      {tool.category}
                    </p>
                    <CardTitle className="mt-2 text-3xl">{tool.name}</CardTitle>
                    <CardDescription className="mt-2 text-base text-foreground/80">
                      {tool.tagline}
                    </CardDescription>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="muted">{getHostnameLabel(tool.website)}</Badge>
                      <Badge>{tool.pricing}</Badge>
                      {tool.verifiedListing ? <Badge variant="accent">Verified listing</Badge> : null}
                      {tool.loginRequired === false ? <Badge variant="muted">No login required</Badge> : null}
                      {tool.skillLevel ? <Badge variant="muted">{tool.skillLevel}</Badge> : null}
                      {tool.featured ? <Badge variant="accent">Featured</Badge> : null}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Rating</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                      {tool.rating.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Reviews</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                      {compactNumber(tool.reviewCount)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Saves</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold capitalize">
                      {compactNumber(tool.favoritesCount)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Visits</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-lg font-semibold">
                      {compactNumber(tool.viewsCount)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Clicks</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-lg font-semibold">
                      {compactNumber(tool.clicksCount)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Added</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-lg font-semibold">
                      {formatRelativeDate(tool.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="surface-subtle p-6">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Overview</h2>
                <p className="mt-3 text-lg leading-8 text-muted-foreground">{tool.description}</p>
                {tool.bestFor?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tool.bestFor.map((item) => (
                      <Badge key={item} variant="muted">
                        Best for: {item}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="surface-subtle p-6">
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Pros</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                    <li>- Clear fit for {tool.category.toLowerCase()} workflows.</li>
                    <li>- Pricing model: {tool.pricing.toLowerCase()}.</li>
                    <li>- Discovery traction: {compactNumber(tool.reviewCount)} reviews and {compactNumber(tool.favoritesCount)} saves.</li>
                    {tool.loginRequired === false ? <li>- No account needed for initial usage.</li> : null}
                  </ul>
                </div>
                <div className="surface-subtle p-6">
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Cons</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                    {tool.loginRequired === true ? <li>- Login required for core actions.</li> : <li>- Public listing may not reflect all premium limitations.</li>}
                    {!tool.screenshots.length ? <li>- No screenshots published yet on this listing.</li> : null}
                    {tool.reviewCount < 20 ? <li>- Limited review volume; validate with a real task trial.</li> : <li>- Compare with alternatives before team-wide adoption.</li>}
                  </ul>
                </div>
              </div>

              <div className="surface-subtle p-6">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">How to use</h2>
                <ol className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  <li>1. Visit the official website and confirm your use case.</li>
                  <li>2. Test one real workflow from start to output.</li>
                  <li>3. Check pricing, login friction, and output quality.</li>
                  <li>4. Compare against at least one alternative before finalizing.</li>
                </ol>
              </div>

              <div className="surface-subtle p-6">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Tags</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <Link key={tag} href={`/tools?tag=${encodeURIComponent(tag)}`}>
                      <Badge variant="muted" className="transition hover:bg-primary hover:text-primary-foreground">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="surface-subtle p-6">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Gallery</h2>
                {tool.screenshots.length ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {tool.screenshots.map((shot) => (
                      <div
                        key={shot}
                        className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-floating"
                      >
                        <div className="relative aspect-[16/10] w-full bg-muted">
                          <SmoothImage
                            src={shot}
                            alt={`${tool.name} screenshot`}
                            fill
                            fadeDurationMs={560}
                            sizes="(min-width: 1280px) 26rem, (min-width: 768px) calc(50vw - 3rem), 100vw"
                            className="object-contain bg-white"
                          />
                        </div>
                        <div className="px-4 py-3 text-sm text-muted-foreground">{getHostnameLabel(tool.website)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.5rem] border border-dashed border-border bg-background/70 px-5 py-10 text-sm text-muted-foreground">
                    Screenshots have not been added yet for this listing.
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="surface-subtle p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Best for</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Teams exploring {tool.category.toLowerCase()} workflows with {tool.pricing.toLowerCase()} pricing.
                  </p>
                </div>
                <div className="surface-subtle p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Discovery signal</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Trending score {tool.trendingScore} with {compactNumber(tool.reviewCount)} community reviews.
                  </p>
                </div>
                <div className="surface-subtle p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Explore more</p>
                  <Link href={`/categories/${tool.categorySlug}`} className="mt-3 block text-sm font-medium text-primary">
                    Browse more {tool.category.toLowerCase()} tools
                  </Link>
                  <Link href={`/alternatives/${tool.slug}`} className="mt-2 block text-sm font-medium text-primary">
                    See alternatives to {tool.name}
                  </Link>
                  {relatedTools[0] ? (
                    <TrackedCompareLink
                      href={`/compare/${tool.slug}-vs-${relatedTools[0].slug}`}
                      sourceSlug={tool.slug}
                      targetSlug={relatedTools[0].slug}
                      className="mt-2 block text-sm font-medium text-primary"
                    >
                      Compare with {relatedTools[0].name}
                    </TrackedCompareLink>
                  ) : null}
                  {workflowsUsingTool[0] ? (
                    <Link
                      href={`/workflows/${workflowsUsingTool[0].slug}`}
                      className="mt-2 block text-sm font-medium text-primary"
                    >
                      Use it inside {workflowsUsingTool[0].title}
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="surface-subtle p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">Related tools</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      More products in {tool.category.toLowerCase()} with overlapping workflows and tags.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/alternatives/${tool.slug}`}>See all alternatives</Link>
                  </Button>
                </div>
                {relatedTools.length ? (
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    {relatedTools.map((relatedTool) => (
                      <Link
                        key={relatedTool.id}
                        href={`/tools/${relatedTool.slug}`}
                        className="rounded-[1.35rem] border border-border/70 bg-background/52 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/82 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{relatedTool.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{relatedTool.tagline}</p>
                          </div>
                          {relatedTool.featured ? <Badge variant="accent">Featured</Badge> : null}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant="muted">{relatedTool.category}</Badge>
                          {relatedTool.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="muted">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.5rem] border border-dashed border-border bg-background/70 px-5 py-10 text-sm text-muted-foreground">
                    Related tools will appear here as more overlapping listings are indexed.
                  </div>
                )}
              </div>

              <div className="surface-subtle p-6">
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">User reviews snapshot</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Current listing shows {tool.rating.toFixed(1)} / 5 from {compactNumber(tool.reviewCount)} reviews.
                  Treat this as directional signal and verify against your own workflow requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
              <CardTitle>Tool snapshot</CardTitle>
              <CardDescription>Key commercial and discovery metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Pricing</span>
                <span className="font-semibold">{tool.pricing}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold">{tool.category}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">User rating</span>
                <span className="font-semibold">{tool.rating.toFixed(1)} / 5</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-semibold">{compactNumber(tool.reviewCount)}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Favorites</span>
                <span className="font-semibold">{compactNumber(tool.favoritesCount)}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Views</span>
                <span className="font-semibold">{compactNumber(tool.viewsCount)}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Clicks</span>
                <span className="font-semibold">{compactNumber(tool.clicksCount)}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Website</span>
                <span className="font-semibold">{getHostnameLabel(tool.website)}</span>
              </div>
              <div className="surface-subtle flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">Login required</span>
                <span className="font-semibold">
                  {tool.loginRequired === true ? "Yes" : tool.loginRequired === false ? "No" : "Unknown"}
                </span>
              </div>
              {tool.skillLevel ? (
                <div className="surface-subtle flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Skill level</span>
                  <span className="font-semibold">{tool.skillLevel}</span>
                </div>
              ) : null}
              {tool.platforms?.length ? (
                <div className="surface-subtle px-4 py-3">
                  <p className="text-muted-foreground">Platforms</p>
                  <p className="mt-1 font-semibold">{tool.platforms.join(", ")}</p>
                </div>
              ) : null}
              {tool.outputTypes?.length ? (
                <div className="surface-subtle px-4 py-3">
                  <p className="text-muted-foreground">Output types</p>
                  <p className="mt-1 font-semibold">{tool.outputTypes.join(", ")}</p>
                </div>
              ) : null}
              {tool.lastCheckedAt ? (
                <div className="surface-subtle flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Last checked</span>
                  <span className="font-semibold">{new Date(tool.lastCheckedAt).toLocaleDateString()}</span>
                </div>
              ) : null}
              {tool.launchYear ? (
                <div className="surface-subtle flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Launch year</span>
                  <span className="font-semibold">{tool.launchYear}</span>
                </div>
              ) : null}
              {tool.featuredUntil ? (
                <div className="surface-subtle flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Featured until</span>
                  <span className="font-semibold">{new Date(tool.featuredUntil).toLocaleDateString()}</span>
                </div>
              ) : null}
              <Button asChild className="mt-2 w-full">
                <Link
                  href={`/go/${tool.slug}`}
                  target="_blank"
                  rel={tool.affiliateUrl ? "nofollow sponsored noreferrer" : "noreferrer"}
                >
                  Visit website
                </Link>
              </Button>
              {action ? <div className="pt-2">{action}</div> : null}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
              <CardTitle>Keep exploring</CardTitle>
              <CardDescription>Jump deeper into the category and alternative paths around this tool.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link
                href={`/categories/${tool.categorySlug}`}
                className="block rounded-[1.35rem] border border-border/70 bg-background/52 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/82 hover:shadow-sm"
              >
                <p className="font-semibold">Browse {tool.category} tools</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Compare more tools in the same category and workflow.
                </p>
              </Link>
              <Link
                href={`/alternatives/${tool.slug}`}
                className="block rounded-[1.35rem] border border-border/70 bg-background/52 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/82 hover:shadow-sm"
              >
                <p className="font-semibold">{tool.name} alternatives</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explore the strongest overlapping options for this use case.
                </p>
              </Link>
              {comparisonTools.slice(0, 2).map((comparisonTool) => (
                <TrackedCompareLink
                  key={comparisonTool.id}
                  href={`/compare/${tool.slug}-vs-${comparisonTool.slug}`}
                  sourceSlug={tool.slug}
                  targetSlug={comparisonTool.slug}
                  className="block rounded-[1.35rem] border border-border/70 bg-background/52 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/82 hover:shadow-sm"
                >
                  <p className="font-semibold">
                    {tool.name} vs {comparisonTool.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Compare pricing, popularity, and workflow fit side by side.
                  </p>
                </TrackedCompareLink>
              ))}
              {workflowsUsingTool.slice(0, 2).map((workflow) => (
                <Link
                  key={workflow.slug}
                  href={`/workflows/${workflow.slug}`}
                  className="block rounded-[1.35rem] border border-border/70 bg-background/52 p-4 transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white/82 hover:shadow-sm"
                >
                  <p className="font-semibold">{workflow.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{workflow.description}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
