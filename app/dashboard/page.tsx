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
  path: "/dashboard"
});

export default async function DashboardPage() {
  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);
  const dashboard = await UserDashboardService.getDashboard(user.id);

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Dashboard"
        title={`Welcome back, ${user.name.split(" ")[0] ?? "there"}.`}
        description="Manage your saved tools, monitor submissions in review, and come back for daily picks based on the AI products you are actively exploring."
        stats={[
          { label: "Saved tools", value: String(dashboard.favorites.total), detail: "bookmarked to your account" },
          { label: "Submitted tools", value: String(dashboard.submissions.total), detail: "currently linked to you" },
          { label: "Notifications", value: String(dashboard.notifications.unreadCount), detail: "new platform updates for you" }
        ]}
      />
      <div className="mt-8">
        <UserDashboard user={user} dashboard={dashboard} />
      </div>
    </div>
  );
}
