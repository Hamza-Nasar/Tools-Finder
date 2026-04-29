import Link from "next/link";
import { getAdminOverview } from "@/lib/data/admin";
import { compactNumber, formatCurrencyFromCents, formatDate } from "@/lib/utils";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/shared/page-hero";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [overview, dashboard] = await Promise.all([getAdminOverview(), AnalyticsService.getDashboardOverview()]);
  const metrics = [
    { label: "Indexed tools", value: compactNumber(overview.metrics.tools), hint: "Live catalog records" },
    { label: "Pending submissions", value: compactNumber(overview.metrics.submissions), hint: "Awaiting review" },
    { label: "Registered users", value: compactNumber(overview.metrics.users), hint: "Known platform accounts" },
    { label: "Categories", value: compactNumber(overview.metrics.categories), hint: "Taxonomy branches" }
  ];

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Overview"
        title="Operate the discovery engine from one premium control surface."
        description="Review incoming submissions, manage spotlight inventory, and keep public discovery structured as the platform scales."
        actions={
          <>
            <Button asChild>
              <Link href="/admin/submissions">Review submissions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/tools">Manage tools</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/categories">Edit categories</Link>
            </Button>
          </>
        }
        stats={metrics.map((metric) => ({
          label: metric.label,
          value: metric.value,
          detail: metric.hint
        }))}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="surface-card-hover">
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-4xl">{metric.value}</CardTitle>
              <p className="text-sm text-muted-foreground">{metric.hint}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <AnalyticsDashboard dashboard={dashboard} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Moderation queue</CardTitle>
                <CardDescription>Newest submissions and their current review state.</CardDescription>
              </div>
              <Badge variant="accent">{overview.metrics.submissions} pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.latestSubmissions.length ? (
              overview.latestSubmissions.map((submission) => (
                <div key={submission.id} className="surface-subtle px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{submission.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{submission.tagline}</p>
                    </div>
                    <Badge variant={submission.status === "approved" ? "accent" : "muted"}>
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{submission.category}</span>
                    <span>{formatDate(submission.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No submissions are waiting in the moderation queue.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <CardTitle>Latest catalog changes</CardTitle>
            <CardDescription>Recently updated or added tools in the live discovery engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.latestTools.map((tool) => (
              <div key={tool.id} className="surface-subtle px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{tool.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
                  </div>
                  {tool.featured ? <Badge variant="accent">Featured</Badge> : <Badge variant="muted">Standard</Badge>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="muted">{tool.category}</Badge>
                  <Badge variant="muted">{tool.pricing}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
          <CardTitle>Recent purchases</CardTitle>
          <CardDescription>Latest paid transactions captured from Stripe checkout flows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.latestPayments.length ? (
            overview.latestPayments.map((payment) => (
              <div key={payment.id} className="surface-subtle px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{payment.toolName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{payment.purchaserEmail ?? "No email captured"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(payment.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{formatCurrencyFromCents(payment.amountTotal, payment.currency)}</Badge>
                    {payment.toolSlug ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/tools/${payment.toolSlug}`}>View details</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No paid purchases recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
