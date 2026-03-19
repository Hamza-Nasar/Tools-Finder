import { getPublicCategories } from "@/lib/data/categories";
import { ToolService } from "@/lib/services/tool-service";
import { ToolManagementConsole } from "@/components/admin/tool-management-console";

export default async function AdminToolsPage() {
  const [tools, categories] = await Promise.all([
    ToolService.listTools({
      page: 1,
      limit: 50,
      includeNonApproved: true,
      sort: "newest"
    }),
    getPublicCategories()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
          Manage tools
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Edit metadata, control featured placement, and create new listings directly against MongoDB-backed records.
        </p>
      </div>
      <ToolManagementConsole tools={tools.data} categories={categories} />
    </div>
  );
}
