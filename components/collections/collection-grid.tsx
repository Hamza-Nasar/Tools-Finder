import Link from "next/link";
import type { ToolCollectionDefinition } from "@/lib/collections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CollectionGrid({ collections }: { collections: ToolCollectionDefinition[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {collections.map((collection) => (
        <Link key={collection.slug} href={`/collections/${collection.slug}`} className="block h-full">
          <Card className="group surface-card-hover h-full overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-gradient-to-br from-white via-white to-background/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{collection.eyebrow}</p>
              <CardTitle className="mt-3">{collection.title}</CardTitle>
              <CardDescription className="mt-2 leading-6">{collection.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 pt-6">
              <span className="text-sm font-medium text-primary">Open collection</span>
              <span className="text-sm text-muted-foreground transition group-hover:text-foreground">Explore</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
