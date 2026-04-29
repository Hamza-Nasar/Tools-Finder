import { connectToDatabase } from "@/lib/mongodb";
import { ProductEventModel } from "@/models/ProductEvent";

type ProductEventType =
  | "tools_search"
  | "finder_search"
  | "tool_detail_view"
  | "compare_view"
  | "cta_click";

export class TelemetryService {
  static async recordEvent(input: {
    eventType: ProductEventType;
    path: string;
    query?: string | null;
    userId?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await connectToDatabase();

    await ProductEventModel.create({
      eventType: input.eventType,
      path: input.path,
      query: input.query?.trim() || null,
      userId: input.userId ?? null,
      metadata: input.metadata ?? {}
    });
  }

  static async getEventKpis(days = 14) {
    await connectToDatabase();
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await ProductEventModel.aggregate<{ eventType: ProductEventType; count: number }>([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
      { $project: { _id: 0, eventType: "$_id", count: 1 } }
    ]);

    const map = new Map(rows.map((row) => [row.eventType, row.count]));

    return {
      toolsSearches: map.get("tools_search") ?? 0,
      finderSearches: map.get("finder_search") ?? 0,
      detailViews: map.get("tool_detail_view") ?? 0,
      compareViews: map.get("compare_view") ?? 0,
      ctaClicks: map.get("cta_click") ?? 0
    };
  }
}

