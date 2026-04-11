import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/server-guards";
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

  return <AdminShell>{children}</AdminShell>;
}
