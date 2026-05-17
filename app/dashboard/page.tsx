import { buildMetadata } from "@/lib/seo";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { UserDashboardService } from "@/lib/services/user-dashboard-service";
import { UserService } from "@/lib/services/user-service";
import { PageHero } from "@/components/shared/page-hero";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Your dashboard",
  description: "Manage your saved tools, submissions, and account activity.",
  path: "/dashboard",
  noIndex: true
});

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const billingParam = Array.isArray(resolvedSearchParams.billing)
    ? resolvedSearchParams.billing[0]
    : resolvedSearchParams.billing;
  const sessionIdParam = Array.isArray(resolvedSearchParams.session_id)
    ? resolvedSearchParams.session_id[0]
    : resolvedSearchParams.session_id;
  const billingStatus =
    billingParam === "success" || billingParam === "cancel" ? billingParam : undefined;

  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);
  const dashboard = await UserDashboardService.getDashboard(user.id);

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Dashboard"
        title={`Welcome back, ${user.name.split(" ")[0] ?? "there"}.`}
        description="Manage your saved tools, monitor submissions in review, and keep an eye on the AI products you are actively exploring."
        stats={[
          { label: "Saved tools", value: String(dashboard.favorites.total), detail: "bookmarked to your account" },
          { label: "Submitted tools", value: String(dashboard.submissions.total), detail: "currently linked to you" },
          { label: "Recent activity", value: String(dashboard.activity.length), detail: "latest saved, viewed, and submitted events" }
        ]}
      />
      <div className="mt-8">
        <UserDashboard
          user={user}
          dashboard={dashboard}
          billingStatus={billingStatus}
          billingSessionId={sessionIdParam}
        />
      </div>
    </div>
  );
}
