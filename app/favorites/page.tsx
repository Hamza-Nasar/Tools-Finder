import { getFavoritesForUser } from "@/lib/data/favorites";
import { buildMetadata } from "@/lib/seo";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { FavoriteToggle } from "@/components/tools/favorite-toggle";
import { ToolCard } from "@/components/tools/tool-card";

export const metadata = buildMetadata({
  title: "Saved tools",
  description: "A personalized list of AI tools favorited by the signed-in user.",
  path: "/favorites"
});

function toPositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export default async function FavoritesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = toPositiveInt(
    Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page,
    1
  );
  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);
  const favorites = await getFavoritesForUser(user.id, page, 12);

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Favorites"
        title="Your saved shortlist."
        description="Keep a private queue of interesting tools and remove them as you narrow your stack."
        stats={[
          { label: "Saved", value: String(favorites.total), detail: "tools synced to your account" },
          { label: "Page", value: String(favorites.page), detail: "current slice of your shortlist" },
          { label: "Status", value: "Synced", detail: "favorites update instantly via server actions" }
        ]}
      />

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Focus</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Save tools while browsing, then return here to compare and decide without losing context.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Workflow</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Move tools into your stack from detail pages once your shortlist is clear.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Signal</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Favorites are account-synced, so they remain available across sessions and devices.
          </p>
        </div>
      </section>

      {favorites.data.length ? (
        <>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {favorites.data.map((item) => (
              <ToolCard
                key={item.favorite.id}
                tool={item.tool}
                action={
                  <FavoriteToggle
                    toolId={item.tool.id}
                    toolSlug={item.tool.slug}
                    initialIsFavorited
                  />
                }
              />
            ))}
          </div>
          <PaginationControls
            page={favorites.page}
            totalPages={favorites.totalPages}
            buildHref={(nextPage) => `/favorites?page=${nextPage}`}
          />
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No saved tools yet"
            description="Browse categories and save tools from a detail page to build your shortlist."
            ctaHref="/tools"
            ctaLabel="Find my tool"
          />
        </div>
      )}
    </div>
  );
}
