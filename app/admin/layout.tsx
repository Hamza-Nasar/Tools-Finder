import { redirect } from "next/navigation";
import { featureFlags } from "@/lib/feature-flags";
import { getOptionalSession } from "@/lib/server-guards";
import { AdminLiveRefresh } from "@/components/admin/admin-live-refresh";
import { AdminShell } from "@/components/layout/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getOptionalSession();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <>
      {featureFlags.adminAutoRefresh ? <AdminLiveRefresh /> : null}
      <AdminShell>{children}</AdminShell>
    </>
  );
}
