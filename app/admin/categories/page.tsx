import { CategoryService } from "@/lib/services/category-service";
import { CategoryManagementConsole } from "@/components/admin/category-management-console";

export default async function AdminCategoriesPage() {
  const categories = await CategoryService.listCategories({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
          Manage categories
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Shape the browse experience, search filters, and category landing pages from a single taxonomy console.
        </p>
      </div>
      <CategoryManagementConsole categories={categories.data} />
    </div>
  );
}
