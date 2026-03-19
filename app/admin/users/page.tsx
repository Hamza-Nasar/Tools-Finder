import { compactNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserService } from "@/lib/services/user-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const users = await UserService.listUsers({ page: 1, limit: 20 });

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

      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
          <CardDescription>Role assignments, moderation, and account controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.data.length ? (
            users.data.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-4">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
                  <Badge variant={user.role === "admin" ? "accent" : "muted"}>{user.role}</Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No user records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
