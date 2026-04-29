import { getPublicCategories } from "@/lib/data/categories";
import { buildMetadata } from "@/lib/seo";
import { compactNumber } from "@/lib/utils";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { PageHero } from "@/components/shared/page-hero";

export const metadata = buildMetadata({
  title: "AI Tool Categories 2026: Writing, Coding, Marketing, Video, and Research",
  description:
    "Explore AI tool categories for writing, coding, design, video, marketing, chatbots, productivity, and research to find the right tool by workflow.",
  path: "/categories",
  keywords: [
    "ai tool categories",
    "ai tools by workflow",
    "writing ai tools",
    "coding ai tools",
    "marketing ai tools"
  ]
});

export default async function CategoriesPage() {
  const categories = await getPublicCategories();
  const totalTools = categories.reduce((sum, category) => sum + category.toolCount, 0);

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Categories"
        title="Find tools by task, not by guesswork."
        description="Every category is designed to scale into a premium landing page with curated discovery, spotlight inventory, and a focused tool feed."
        stats={[
          { label: "Categories", value: compactNumber(categories.length), detail: "covering the major AI workflows" },
          { label: "Indexed tools", value: compactNumber(totalTools), detail: "ready to filter and compare" },
          { label: "Browse mode", value: "Curated", detail: "built for fast category-first discovery" }
        ]}
      />
      <div className="mt-8">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}

