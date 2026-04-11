import { UserService } from "@/lib/services/user-service";
import { AdminInviteService } from "@/lib/services/admin-invite-service";
import { compactNumber } from "@/lib/utils";
import { requireAdminSession } from "@/lib/server-guards";
import { UserManagementConsole } from "@/components/admin/user-management-console";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const session = await requireAdminSession();
  const [users, invites] = await Promise.all([
    UserService.listUsers({ page: 1, limit: 20 }),
    AdminInviteService.listPendingInvites()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
          Manage users
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Review account growth and keep an eye on who has access to moderation workflows.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total users</CardDescription>
            <CardTitle className="text-4xl">{compactNumber(users.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Admins on this page</CardDescription>
            <CardTitle className="text-4xl">
              {compactNumber(users.data.filter((user) => user.role === "admin").length)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Users on this page</CardDescription>
            <CardTitle className="text-4xl">
              {compactNumber(users.data.filter((user) => user.role === "user").length)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <UserManagementConsole initialUsers={users.data} initialInvites={invites} currentUserId={session.user.id} />
    </div>
  );
}
