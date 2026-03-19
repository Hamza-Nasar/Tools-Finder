import Link from "next/link";
import type { Category } from "@/types";
import { categoryGradientMap } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { compactNumber } from "@/lib/utils";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories.length) {
    return (
      <EmptyState
        label="Catalog"
        title="No categories are available right now"
        description="The directory is either still empty or temporarily unable to load category data."
        ctaHref="/submit"
        ctaLabel="Submit a tool"
      />
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {categories.map((category) => (
        <Link key={category.slug} href={`/categories/${category.slug}`}>
          <Card className="group surface-card-hover h-full overflow-hidden">
            <CardHeader className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-white to-background/60">
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${categoryGradientMap[category.slug] ?? "from-primary to-primary/70"} font-[family-name:var(--font-heading)] text-xl font-semibold text-white shadow-sm`}
              >
                {category.name.slice(0, 2).toUpperCase()}
              </div>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription className="mt-2 leading-6">{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 pt-6">
              <span className="text-sm font-medium text-primary">{compactNumber(category.toolCount)} tools indexed</span>
              <span className="text-sm text-muted-foreground transition group-hover:text-foreground">
                Explore
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
