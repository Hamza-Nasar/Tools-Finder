import { NewsletterStore } from "@/lib/newsletter-store";
import { compactNumber, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminNewsletterPage() {
  const [overview, subscriptions] = await Promise.all([
    NewsletterStore.getOverview(),
    NewsletterStore.listSubscriptions({ page: 1, limit: 50 })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
          Newsletter leads
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Popup, homepage, and tool-page subscriptions are stored in a separate newsletter database so you can review them cleanly as admin.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Database: <span className="font-medium text-foreground">{NewsletterStore.getDatabaseName()}</span>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total leads</CardDescription>
            <CardTitle className="text-4xl">{compactNumber(overview.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active subscribers</CardDescription>
            <CardTitle className="text-4xl">{compactNumber(overview.active)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Exit intent signups</CardDescription>
            <CardTitle className="text-4xl">{compactNumber(overview.exitIntent)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent subscribers</CardTitle>
          <CardDescription>The latest newsletter leads collected across the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptions.data.length ? (
            subscriptions.data.map((subscription) => (
              <div
                key={subscription.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{subscription.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Sources: {subscription.sources.join(", ") || "unknown"}
                  </p>
                  {subscription.pagePaths.length ? (
                    <p className="text-sm text-muted-foreground">
                      Paths: {subscription.pagePaths.slice(0, 3).join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Last signup {formatDate(subscription.lastSubscribedAt)}
                  </span>
                  <Badge variant="muted">{subscription.signupCount} signups</Badge>
                  <Badge variant={subscription.status === "active" ? "accent" : "muted"}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No newsletter leads found yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
