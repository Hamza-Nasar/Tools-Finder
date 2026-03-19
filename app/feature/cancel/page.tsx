import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Featured checkout canceled",
  description: "The featured listing checkout was canceled.",
  path: "/feature/cancel",
  noIndex: true
});

export default async function FeatureCancelPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = typeof params.slug === "string" ? params.slug : undefined;

  return (
    <div className="page-frame py-12">
      <EmptyState
        label="Canceled"
        title="Featured checkout was canceled"
        description="No payment was captured. You can return to the listing and restart checkout whenever you are ready."
        ctaHref={slug ? `/tools/${slug}` : "/tools"}
        ctaLabel="Back to listing"
      />
      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/tools">Browse the directory</Link>
        </Button>
      </div>
    </div>
  );
}
