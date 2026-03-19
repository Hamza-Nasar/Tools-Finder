import { getPublicCategories } from "@/lib/data/categories";
import { SubmissionService } from "@/lib/services/submission-service";
import { SubmissionManagementConsole } from "@/components/admin/submission-management-console";

export default async function AdminSubmissionsPage() {
  const [submissions, categories] = await Promise.all([
    SubmissionService.listSubmissions({ page: 1, limit: 20 }),
    getPublicCategories()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">
          Review submissions
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Clean up metadata before approval, leave moderation notes, and push approved tools into the live directory.
        </p>
      </div>
      <SubmissionManagementConsole submissions={submissions.data} categories={categories} />
    </div>
  );
}
