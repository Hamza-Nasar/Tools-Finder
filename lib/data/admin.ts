import { cache } from "react";
import { CategoryService } from "@/lib/services/category-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { ToolService } from "@/lib/services/tool-service";
import { UserService } from "@/lib/services/user-service";

export const getAdminOverview = cache(async () => {
  const [tools, submissions, pendingSubmissions, categories, users] = await Promise.all([
    ToolService.listTools({ page: 1, limit: 6, includeNonApproved: true, sort: "newest" }),
    SubmissionService.listSubmissions({ page: 1, limit: 6 }),
    SubmissionService.listSubmissions({ page: 1, limit: 1, status: "pending" }),
    CategoryService.listCategories({ page: 1, limit: 20 }),
    UserService.listUsers({ page: 1, limit: 20 })
  ]);

  return {
    metrics: {
      tools: tools.total,
      submissions: pendingSubmissions.total,
      categories: categories.total,
      users: users.total
    },
    latestTools: tools.data,
    latestSubmissions: submissions.data,
    categories: categories.data
  };
});
