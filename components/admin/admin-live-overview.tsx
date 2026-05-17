"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { compactNumber, formatCurrencyFromCents, formatDate } from "@/lib/utils";
import type { AnalyticsService } from "@/lib/services/analytics-service";

type DashboardOverview = Awaited<ReturnType<typeof AnalyticsService.getDashboardOverview>>;
type AdminOverview = Awaited<ReturnType<typeof import("@/lib/data/admin").getAdminOverview>>;

export function AdminLiveOverview({
  initialOverview,
  initialDashboard,
  intervalMs = 12000
}: {
  initialOverview: AdminOverview;
  initialDashboard: DashboardOverview;
  intervalMs?: number;
}) {
  const [overview, setOverview] = useState(initialOverview);
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastUpdatedLabel = new Date(lastUpdated).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  async function refreshData() {
    const response = await fetch("/api/admin/dashboard", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Failed to refresh admin dashboard.");
    }

    const payload = (await response.json()) as {
      data?: {
        overview: AdminOverview;
        dashboard: DashboardOverview;
        generatedAt: string;
      };
    };

    if (!payload.data) {
      throw new Error("Dashboard response payload is empty.");
    }

    setOverview(payload.data.overview);
    setDashboard(payload.data.dashboard);
    setLastUpdated(payload.data.generatedAt);
    setRefreshError(null);
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      startTransition(async () => {
        try {
          await refreshData();
        } catch {
          setRefreshError("Live refresh failed. Showing last successful snapshot.");
        }
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs]);

  const metrics = useMemo(
    () => [
      { label: "Indexed tools", value: compactNumber(overview.metrics.tools), hint: "Live catalog records" },
      { label: "Pending submissions", value: compactNumber(overview.metrics.submissions), hint: "Awaiting review" },
      { label: "Registered users", value: compactNumber(overview.metrics.users), hint: "Known platform accounts" },
      { label: "Categories", value: compactNumber(overview.metrics.categories), hint: "Taxonomy branches" }
    ],
    [overview.metrics.categories, overview.metrics.submissions, overview.metrics.tools, overview.metrics.users]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-border/70 bg-white/90 px-4 py-3">
        <div className="text-sm text-muted-foreground">
          Last synced: <span className="font-medium text-foreground">{lastUpdatedLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {refreshError ? <Badge variant="muted">{refreshError}</Badge> : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await refreshData();
                } catch {
                  setRefreshError("Manual refresh failed.");
                }
              })
            }
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh now
          </Button>
        </div>
      </div>

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
              <p className="text-sm text-muted-foreground">No submissions are waiting in the moderation queue.</p>
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
