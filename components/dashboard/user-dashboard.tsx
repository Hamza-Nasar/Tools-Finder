import Link from "next/link";
import type { Tool, UserActivity, Submission, UserNotification } from "@/types";
import { markNotificationsReadAction } from "@/lib/actions/notification-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { FavoriteToggle } from "@/components/tools/favorite-toggle";
import { ToolCard } from "@/components/tools/tool-card";
import { formatDate, formatRelativeDate } from "@/lib/utils";

interface DashboardToolFavorite {
  favorite: {
    id: string;
  };
  tool: Parameters<typeof ToolCard>[0]["tool"];
}

interface UserDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: "user" | "admin";
    createdAt: string;
  };
  dashboard: {
    favorites: {
      data: DashboardToolFavorite[];
      total: number;
    };
    submissions: {
      data: Submission[];
      total: number;
    };
    activity: UserActivity[];
    notifications: {
      data: UserNotification[];
      unreadCount: number;
    };
    dailyPicks: {
      personalized: boolean;
      tools: Tool[];
      categorySlugs: string[];
      tags: string[];
    };
  };
}

function getInitials(name: string, email: string) {
  const fallback = name.trim() || email.trim() || "User";
  return fallback
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getActivityCopy(activity: UserActivity) {
  switch (activity.kind) {
    case "tool_saved":
      return {
        title: `Saved ${activity.toolName ?? "a tool"}`,
        href: activity.toolSlug ? `/tools/${activity.toolSlug}` : "/favorites",
        linkLabel: "View tool"
      };
    case "tool_submitted":
      return {
        title: `Submitted ${activity.submissionName ?? "a tool"} for review`,
        href: "/dashboard",
        linkLabel: "View submissions"
      };
    case "tool_viewed":
      return {
        title: `Viewed ${activity.toolName ?? "a tool"}`,
        href: activity.toolSlug ? `/tools/${activity.toolSlug}` : "/tools",
        linkLabel: "Open tool"
      };
    default:
      return {
        title: "Recent activity",
        href: "/dashboard",
        linkLabel: "Open dashboard"
      };
  }
}

function getNotificationLink(notification: UserNotification) {
  return notification.href ?? "/dashboard";
}

function SubmissionStatusBadge({ status }: { status: Submission["status"] }) {
  if (status === "approved") {
    return <Badge variant="accent">Approved</Badge>;
  }

  if (status === "rejected") {
    return <Badge variant="default">Rejected</Badge>;
  }

  return <Badge variant="muted">Pending review</Badge>;
}

function formatTopicLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function UserDashboard({ user, dashboard }: UserDashboardProps) {
  return (
    <div className="space-y-8">
      <section id="notifications" className="space-y-5 scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Notifications</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              Account updates
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Approval decisions, review queue updates, and featured placement purchases appear here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={dashboard.notifications.unreadCount ? "accent" : "muted"}>
              {dashboard.notifications.unreadCount} unread
            </Badge>
            {dashboard.notifications.unreadCount ? (
              <form action={markNotificationsReadAction}>
                <Button type="submit" variant="outline" size="sm">
                  Mark all read
                </Button>
              </form>
            ) : null}
          </div>
        </div>

        {dashboard.notifications.data.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {dashboard.notifications.data.map((notification) => (
              <Card key={notification.id} className="surface-card-hover">
                <CardHeader className="border-b border-border/70">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{notification.title}</CardTitle>
                      <CardDescription className="mt-2">{notification.message}</CardDescription>
                    </div>
                    {notification.readAt ? <Badge variant="muted">Read</Badge> : <Badge variant="accent">New</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <p className="text-sm text-muted-foreground">{formatRelativeDate(notification.createdAt)}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={getNotificationLink(notification)}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            label="Notifications"
            title="No notifications yet"
            description="When your submissions are reviewed or your paid placement goes live, updates will show up here."
            ctaHref="/submit"
            ctaLabel="Submit a tool"
          />
        )}
      </section>

      <section id="daily-picks" className="space-y-5 scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Daily picks</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              {dashboard.dailyPicks.personalized ? "Picked for your workflow" : "What is worth checking today"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {dashboard.dailyPicks.personalized
                ? `Based on what you saved in ${dashboard.dailyPicks.categorySlugs.map(formatTopicLabel).join(", ") || "the directory"}.`
                : "Save tools you like and the dashboard will start tailoring this section to your interests."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/today-ai-tools">View daily feed</Link>
          </Button>
        </div>

        {dashboard.dailyPicks.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {dashboard.dailyPicks.tags.map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {dashboard.dailyPicks.tools.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {dashboard.dailyPicks.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                action={<FavoriteToggle toolId={tool.id} toolSlug={tool.slug} initialIsFavorited={false} />}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Daily"
            title="No daily picks yet"
            description="Browse and save a few tools first. The dashboard will use that behavior to surface more relevant picks each day."
            ctaHref="/tools"
            ctaLabel="Explore tools"
          />
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle>Account profile</CardTitle>
            <CardDescription>Your workspace identity, role, and join date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/12 text-lg font-semibold text-primary">
                  {getInitials(user.name, user.email)}
                </div>
              )}
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-border/70 bg-white/70 p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary">Role</p>
                <p className="mt-3 text-lg font-semibold capitalize">{user.role}</p>
              </div>
              <div className="rounded-[1.35rem] border border-border/70 bg-white/70 p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary">Joined</p>
                <p className="mt-3 text-lg font-semibold">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Saved, submitted, and viewed tools tied to your account.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {dashboard.activity.length ? (
              <div className="space-y-3">
                {dashboard.activity.map((activity) => {
                  const copy = getActivityCopy(activity);

                  return (
                    <div
                      key={activity.id}
                      className="flex flex-col gap-3 rounded-[1.35rem] border border-border/70 bg-white/70 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">{copy.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{formatRelativeDate(activity.createdAt)}</p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={copy.href}>{copy.linkLabel}</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                label="Activity"
                title="No activity yet"
                description="Save a tool, open a tool page, or submit a listing to start building your dashboard history."
                ctaHref="/tools"
                ctaLabel="Explore tools"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <section id="saved-tools" className="space-y-5 scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Saved tools</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              Your shortlist
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tools you have saved for later comparison.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/favorites">View all favorites</Link>
          </Button>
        </div>

        {dashboard.favorites.data.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {dashboard.favorites.data.map((item) => (
              <ToolCard
                key={item.favorite.id}
                tool={item.tool}
                action={
                  <FavoriteToggle toolId={item.tool.id} toolSlug={item.tool.slug} initialIsFavorited />
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Saved"
            title="No saved tools yet"
            description="Use the save button on tool cards and detail pages to build a personal shortlist."
            ctaHref="/tools"
            ctaLabel="Browse tools"
          />
        )}
      </section>

      <section id="submitted-tools" className="space-y-5 scroll-mt-28">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Submitted tools</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
              Your review queue
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Track the moderation status of tools you have submitted.
            </p>
          </div>
          <Button asChild>
            <Link href="/submit">Submit another tool</Link>
          </Button>
        </div>

        {dashboard.submissions.data.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {dashboard.submissions.data.map((submission) => (
              <Card key={submission.id} className="surface-card-hover">
                <CardHeader className="border-b border-border/70">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{submission.name}</CardTitle>
                      <CardDescription className="mt-2">{submission.tagline}</CardDescription>
                    </div>
                    <SubmissionStatusBadge status={submission.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{submission.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="muted">{submission.category}</Badge>
                    <Badge variant="default">{submission.pricing}</Badge>
                    {submission.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>Submitted {formatDate(submission.createdAt)}</span>
                    {submission.status === "approved" ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/tools/${submission.slug}`}>View published tool</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" size="sm">
                        <Link href={submission.website} target="_blank" rel="noreferrer">
                          Visit website
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            label="Submissions"
            title="No submissions yet"
            description="Submit your first tool to start the moderation and publishing flow."
            ctaHref="/submit"
            ctaLabel="Submit a tool"
          />
        )}
      </section>
    </div>
  );
}
