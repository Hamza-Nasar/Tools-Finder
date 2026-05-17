import { handleApiError, ok } from "@/lib/api";
import { getAdminOverview } from "@/lib/data/admin";
import { requireAdminSession } from "@/lib/server-guards";
import { AnalyticsService } from "@/lib/services/analytics-service";

export async function GET() {
  try {
    await requireAdminSession();
    const [overview, dashboard] = await Promise.all([
      getAdminOverview(),
      AnalyticsService.getDashboardOverview()
    ]);

    return ok({
      overview,
      dashboard,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error);
  }
}

