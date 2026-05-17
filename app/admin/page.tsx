import Link from "next/link";
import { getAdminOverview } from "@/lib/data/admin";
import { compactNumber } from "@/lib/utils";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { AdminLiveOverview } from "@/components/admin/admin-live-overview";
import { Button } from "@/components/ui/button";
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

      <AdminLiveOverview initialOverview={overview} initialDashboard={dashboard} />
    </div>
  );
}
