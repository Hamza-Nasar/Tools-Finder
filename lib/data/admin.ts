import { CategoryService } from "@/lib/services/category-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { ToolService } from "@/lib/services/tool-service";
import { UserService } from "@/lib/services/user-service";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentRecordModel } from "@/models/PaymentRecord";
import { ToolModel } from "@/models/Tool";

export async function getAdminOverview() {
  await connectToDatabase();
  const [tools, submissions, pendingSubmissions, categories, users] = await Promise.all([
    ToolService.listTools({ page: 1, limit: 6, includeNonApproved: true, sort: "newest" }),
    SubmissionService.listSubmissions({ page: 1, limit: 6 }),
    SubmissionService.listSubmissions({ page: 1, limit: 1, status: "pending" }),
    CategoryService.listCategories({ page: 1, limit: 20 }),
    UserService.listUsers({ page: 1, limit: 20 })
  ]);
  const latestPaymentRows = await PaymentRecordModel.find({ status: "paid" })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  const toolIds = latestPaymentRows.map((row) => row.toolId);
  const paymentTools = toolIds.length
    ? await ToolModel.find({ _id: { $in: toolIds } }, { _id: 1, name: 1, slug: 1 }).lean<
        { _id: { toString(): string }; name: string; slug: string }[]
      >()
    : [];
  const paymentToolsById = new Map(paymentTools.map((tool) => [tool._id.toString(), tool]));

  return {
    metrics: {
      tools: tools.total,
      submissions: pendingSubmissions.total,
      categories: categories.total,
      users: users.total
    },
    latestTools: tools.data,
    latestSubmissions: submissions.data,
    categories: categories.data,
    latestPayments: latestPaymentRows.map((row) => {
      const tool = paymentToolsById.get(String(row.toolId));

      return {
        id: String(row._id),
        toolName: tool?.name ?? "Unknown tool",
        toolSlug: tool?.slug ?? null,
        purchaserEmail: row.purchaserEmail ?? null,
        amountTotal: row.amountTotal,
        currency: row.currency,
        createdAt:
          row.createdAt instanceof Date ? row.createdAt.toISOString() : new Date(row.createdAt ?? Date.now()).toISOString()
      };
    })
  };
}
