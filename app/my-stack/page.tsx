import { buildMetadata } from "@/lib/seo";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { StackService } from "@/lib/services/stack-service";
import { ShortlistService } from "@/lib/services/shortlist-service";
import { ToolService } from "@/lib/services/tool-service";
import { UserService } from "@/lib/services/user-service";
import { PageHero } from "@/components/shared/page-hero";
import { StackBuilder } from "@/components/tools/stack-builder";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = buildMetadata({
  title: "My AI Stack",
  description: "Create and manage a personal AI stack for your workflow.",
  path: "/my-stack",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function MyStackPage() {
  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);
  const [stack, shortlists] = await Promise.all([
    StackService.getStackForUser(user.id),
    ShortlistService.listForUser(user.id, 8)
  ]);
  const suggested = await ToolService.listTools({
    page: 1,
    limit: 12,
    sort: "popular"
  });
  const suggestedTools = suggested.data.filter((tool) => !stack.tools.some((stackTool) => stackTool.id === tool.id)).slice(0, 6);

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="My stack"
        title={stack.name}
        description={stack.description ?? "Build a focused AI stack around the way you actually work."}
        stats={[
          { label: "Tools in stack", value: String(stack.tools.length), detail: "saved to your account" },
          { label: "Updated", value: new Date(stack.updatedAt).toLocaleDateString(), detail: "latest saved version" }
        ]}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Stack strategy</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Keep one primary tool per critical step, then add alternates only where reliability matters.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Suggested additions</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Suggestions below are filtered to exclude tools already in your stack.
          </p>
        </div>
      </section>

      <section className="mt-8 section-shell p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Saved shortlists</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-semibold">Finder decisions you can reuse</h2>
          </div>
          <Badge variant="muted">{shortlists.length} saved</Badge>
        </div>
        {shortlists.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {shortlists.map((shortlist) => (
              <Link
                key={shortlist.id}
                href={`/shortlists/${shortlist.shareSlug}`}
                className="rounded-[1.2rem] border border-border/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <p className="font-medium text-foreground">{shortlist.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{shortlist.query}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {shortlist.tools.length} tools • updated {new Date(shortlist.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No saved shortlists yet. Use AI Finder and click “Save this shortlist”.
          </p>
        )}
      </section>

      <div className="mt-10 section-shell p-2 md:p-3">
        <StackBuilder stack={stack} suggestedTools={suggestedTools} />
      </div>
    </div>
  );
}
