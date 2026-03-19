import Link from "next/link";
import { BarChart3, MousePointerClick, Sparkles, Star, TrendingUp } from "lucide-react";
import type { AnalyticsService } from "@/lib/services/analytics-service";
import { compactNumber, formatCurrencyFromCents, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardOverview = Awaited<ReturnType<typeof AnalyticsService.getDashboardOverview>>;

function MetricCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="surface-card-hover">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardHeader>
    </Card>
  );
}

function MiniBarChart({
  title,
  description,
  points,
  colorClass,
  valueKey
}: {
  title: string;
  description: string;
  points: DashboardOverview["series"];
  colorClass: string;
  valueKey: "views" | "clicks" | "submissions" | "revenue";
}) {
  const maxValue = Math.max(...points.map((point) => point[valueKey]), 1);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex h-48 items-end gap-2">
          {points.map((point) => {
            const value = point[valueKey];
            const height = Math.max((value / maxValue) * 100, value > 0 ? 8 : 2);

            return (
              <div key={`${title}-${point.label}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-[11px] font-medium text-muted-foreground">
                  {valueKey === "revenue" ? formatCurrencyFromCents(value) : compactNumber(value)}
                </div>
                <div className="flex h-36 w-full items-end">
                  <div
                    className={`w-full rounded-t-[1rem] ${colorClass}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground">{point.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ToolListCard({
  title,
  description,
  tools,
  icon
}: {
  title: string;
  description: string;
  tools: DashboardOverview["topTools"]["mostViewed"];
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary/80 text-secondary-foreground">
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {tools.length ? (
          tools.map((tool, index) => (
            <Link
              key={`${title}-${tool.id}`}
              href={`/tools/${tool.slug}`}
              className="surface-subtle flex items-center justify-between gap-3 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/85"
            >
              <div>
                <p className="font-semibold">
                  {index + 1}. {tool.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{compactNumber(tool.viewsCount)} views</div>
                <div>{compactNumber(tool.clicksCount)} clicks</div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No data has been recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({
  dashboard
}: {
  dashboard: DashboardOverview;
}) {
  const metrics = [
    {
      label: "Revenue",
      value: formatCurrencyFromCents(dashboard.metrics.totalRevenue, dashboard.metrics.revenueCurrency),
      detail: `${compactNumber(dashboard.metrics.paidFeaturedListings)} paid featured listings`
    },
    {
      label: "Active featured",
      value: compactNumber(dashboard.metrics.activeFeaturedListings),
      detail: "Listings currently occupying premium placement"
    },
    {
      label: "Tracked clicks",
      value: compactNumber(dashboard.metrics.totalClicks),
      detail: "Affiliate and outbound visit redirects measured internally"
    },
    {
      label: "Pending submissions",
      value: compactNumber(dashboard.metrics.pendingSubmissions),
      detail: "Listings waiting for moderation review"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MiniBarChart
          title="Discovery activity"
          description="Daily view activity over the last two weeks."
          points={dashboard.series}
          colorClass="bg-gradient-to-t from-primary to-primary/60"
          valueKey="views"
        />
        <MiniBarChart
          title="Featured revenue"
          description="Daily Stripe revenue from featured listing purchases."
          points={dashboard.series}
          colorClass="bg-gradient-to-t from-secondary-foreground to-secondary"
          valueKey="revenue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <ToolListCard
          title="Most viewed"
          description="Top public listings by total views."
          tools={dashboard.topTools.mostViewed}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <ToolListCard
          title="Most favorited"
          description="Listings with the strongest save intent."
          tools={dashboard.topTools.mostFavorited}
          icon={<Star className="h-5 w-5" />}
        />
        <ToolListCard
          title="Trending now"
          description="Listings rising on recent favorites, views, clicks, and recency."
          tools={dashboard.topTools.trending}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <CardTitle>Top categories</CardTitle>
            <CardDescription>Which taxonomies are driving the most directory demand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {dashboard.topCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="surface-subtle flex items-center justify-between gap-3 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/85"
              >
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {compactNumber(category.toolCount)} tools, {compactNumber(category.totalViews)} views
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{compactNumber(category.totalFavorites)} saves</div>
                  <div>{compactNumber(category.totalClicks)} clicks</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>Latest successful featured listing purchases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {dashboard.recentPayments.length ? (
              dashboard.recentPayments.map((payment) => (
                <div key={payment.id} className="surface-subtle px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{payment.toolName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {payment.purchaserEmail ?? "No purchaser email captured"}
                      </p>
                    </div>
                    <Badge variant="accent">
                      {formatCurrencyFromCents(payment.amountTotal, payment.currency)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{formatDate(payment.createdAt)}</span>
                    <span>
                      {payment.featuredUntil
                        ? `Active until ${formatDate(payment.featuredUntil)}`
                        : "No expiration date"}
                    </span>
                    {payment.toolSlug ? (
                      <Link href={`/tools/${payment.toolSlug}`} className="font-medium text-primary">
                        Open listing
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No featured payments have been captured yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MousePointerClick className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Most clicked</CardTitle>
                <CardDescription>Listings converting the most outbound intent.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {dashboard.topTools.mostClicked.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="surface-subtle flex items-center justify-between gap-3 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white/85"
              >
                <div>
                  <p className="font-semibold">{tool.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{compactNumber(tool.clicksCount)} clicks</div>
                  <div>{compactNumber(tool.viewsCount)} views</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/70 text-accent-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Revenue overview</CardTitle>
                <CardDescription>Featured placement is ready to monetize from day one.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {dashboard.revenue.totals.map((row) => (
              <div key={row.currency} className="surface-subtle px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold uppercase">{row.currency}</p>
                  <Badge variant="accent">{formatCurrencyFromCents(row.totalRevenue, row.currency)}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <span>Paid placements</span>
                  <span className="text-right font-medium text-foreground">
                    {compactNumber(row.paidFeaturedListings)}
                  </span>
                  <span>Active placements</span>
                  <span className="text-right font-medium text-foreground">
                    {compactNumber(row.activeFeaturedListings)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
