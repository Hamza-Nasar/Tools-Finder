import { connectToDatabase } from "@/lib/mongodb";
import { serializeTool } from "@/lib/serializers/tool";
import { ToolModel } from "@/models/Tool";
import { ToolActivityModel } from "@/models/ToolActivity";
import { SubmissionModel } from "@/models/Submission";
import { UserModel } from "@/models/User";
import { PaymentRecordModel } from "@/models/PaymentRecord";
import { FeaturedListingService } from "@/lib/services/featured-listing-service";
import { ToolService } from "@/lib/services/tool-service";

function getBucketDateKey(date: Date) {
  const bucket = new Date(date);
  bucket.setUTCHours(0, 0, 0, 0);
  return bucket.toISOString().slice(0, 10);
}

function getRecentDayKeys(days: number) {
  const results: { key: string; label: string }[] = [];
  const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const value = new Date(now);
    value.setUTCDate(value.getUTCDate() - index);
    value.setUTCHours(0, 0, 0, 0);
    results.push({
      key: getBucketDateKey(value),
      label: formatter.format(value)
    });
  }

  return results;
}

export class AnalyticsService {
  static async getDashboardOverview(days = 14) {
    await connectToDatabase();
    await FeaturedListingService.expireListingsIfNeeded();

    const recentDayKeys = getRecentDayKeys(days);
    const cutoffDate = new Date();
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - (days - 1));
    cutoffDate.setUTCHours(0, 0, 0, 0);

    const [
      toolCount,
      userCount,
      submissionCount,
      pendingSubmissionCount,
      activeFeaturedCount,
      totals,
      revenueOverview,
      mostViewedRecords,
      mostFavoritedRecords,
      mostClickedRecords,
      mostComparedRecords,
      trendingTools,
      topCategories,
      activityRows,
      submissionRows,
      paymentRows,
      recentPayments
    ] = await Promise.all([
      ToolModel.countDocuments({ status: "approved" }),
      UserModel.countDocuments({}),
      SubmissionModel.countDocuments({}),
      SubmissionModel.countDocuments({ status: "pending" }),
      ToolModel.countDocuments({
        featured: true,
        $or: [{ featuredUntil: null }, { featuredUntil: { $gte: new Date() } }]
      }),
      ToolModel.aggregate<{ _id: null; views: number; favorites: number; clicks: number; comparisonClicks: number }>([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: null,
            views: { $sum: "$viewsCount" },
            favorites: { $sum: "$favoritesCount" },
            clicks: { $sum: "$clicksCount" },
            comparisonClicks: { $sum: "$comparisonClicksCount" }
          }
        }
      ]),
      FeaturedListingService.getRevenueOverview(),
      ToolModel.find({ status: "approved" })
        .sort({ viewsCount: -1, favoritesCount: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      ToolModel.find({ status: "approved" })
        .sort({ favoritesCount: -1, latestFavoriteAt: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      ToolModel.find({ status: "approved" })
        .sort({ clicksCount: -1, latestClickAt: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      ToolModel.find({ status: "approved" })
        .sort({ comparisonClicksCount: -1, clicksCount: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      ToolService.listTrendingTools(5),
      ToolModel.aggregate<{
        slug: string;
        name: string;
        toolCount: number;
        totalViews: number;
        totalFavorites: number;
        totalClicks: number;
        totalComparisonClicks: number;
      }>([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: { slug: "$categorySlug", name: "$categoryName" },
            toolCount: { $sum: 1 },
            totalViews: { $sum: "$viewsCount" },
            totalFavorites: { $sum: "$favoritesCount" },
            totalClicks: { $sum: "$clicksCount" },
            totalComparisonClicks: { $sum: "$comparisonClicksCount" }
          }
        },
        { $sort: { toolCount: -1, totalViews: -1 } },
        { $limit: 6 },
        {
          $project: {
            _id: 0,
            slug: "$_id.slug",
            name: "$_id.name",
            toolCount: 1,
            totalViews: 1,
            totalFavorites: 1,
            totalClicks: 1,
            totalComparisonClicks: 1
          }
        }
      ]),
      ToolActivityModel.aggregate<{
        key: string;
        views: number;
        favorites: number;
        clicks: number;
        comparisonClicks: number;
      }>([
        { $match: { bucketDate: { $gte: cutoffDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$bucketDate" }
            },
            views: { $sum: "$views" },
            favorites: { $sum: "$favorites" },
            clicks: { $sum: "$clicks" },
            comparisonClicks: { $sum: "$comparisonClicks" }
          }
        },
        {
          $project: {
            _id: 0,
            key: "$_id",
            views: 1,
            favorites: 1,
            clicks: 1,
            comparisonClicks: 1
          }
        }
      ]),
      SubmissionModel.aggregate<{
        key: string;
        submissions: number;
      }>([
        { $match: { createdAt: { $gte: cutoffDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            submissions: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            key: "$_id",
            submissions: 1
          }
        }
      ]),
      PaymentRecordModel.aggregate<{
        key: string;
        purchases: number;
        revenue: number;
      }>([
        { $match: { status: "paid", createdAt: { $gte: cutoffDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            purchases: { $sum: 1 },
            revenue: { $sum: "$amountTotal" }
          }
        },
        {
          $project: {
            _id: 0,
            key: "$_id",
            purchases: 1,
            revenue: 1
          }
        }
      ]),
      PaymentRecordModel.find({ status: "paid" }).sort({ createdAt: -1 }).limit(6).lean()
    ]);

    const toolIds = recentPayments.map((record) => String(record.toolId));
    const paymentTools = toolIds.length
      ? await ToolModel.find({ _id: { $in: recentPayments.map((record) => record.toolId) } })
          .select({ _id: 1, name: 1, slug: 1 })
          .lean<{ _id: { toString(): string }; name: string; slug: string }[]>()
      : [];
    const paymentToolsById = new Map(paymentTools.map((tool) => [tool._id.toString(), tool]));

    const seriesMap = new Map(
      recentDayKeys.map((point) => [
        point.key,
        {
          label: point.label,
          views: 0,
          favorites: 0,
          clicks: 0,
          comparisonClicks: 0,
          submissions: 0,
          purchases: 0,
          revenue: 0
        }
      ])
    );

    for (const row of activityRows) {
      const current = seriesMap.get(row.key);
      if (!current) continue;
      current.views = row.views;
      current.favorites = row.favorites;
      current.clicks = row.clicks;
      current.comparisonClicks = row.comparisonClicks;
    }

    for (const row of submissionRows) {
      const current = seriesMap.get(row.key);
      if (!current) continue;
      current.submissions = row.submissions;
    }

    for (const row of paymentRows) {
      const current = seriesMap.get(row.key);
      if (!current) continue;
      current.purchases = row.purchases;
      current.revenue = row.revenue;
    }

    const totalsRow = totals[0] ?? { views: 0, favorites: 0, clicks: 0, comparisonClicks: 0 };
    const primaryRevenue = revenueOverview.totals[0] ?? {
      currency: "usd",
      totalRevenue: 0,
      paidFeaturedListings: 0,
      activeFeaturedListings: activeFeaturedCount
    };

    return {
      metrics: {
        tools: toolCount,
        users: userCount,
        submissions: submissionCount,
        pendingSubmissions: pendingSubmissionCount,
        activeFeaturedListings: activeFeaturedCount,
        totalViews: totalsRow.views,
        totalFavorites: totalsRow.favorites,
        totalClicks: totalsRow.clicks,
        totalComparisonClicks: totalsRow.comparisonClicks,
        totalRevenue: primaryRevenue.totalRevenue,
        revenueCurrency: primaryRevenue.currency,
        paidFeaturedListings: primaryRevenue.paidFeaturedListings
      },
      revenue: revenueOverview,
      topTools: {
        mostViewed: mostViewedRecords.map((record) => serializeTool(record)),
        mostFavorited: mostFavoritedRecords.map((record) => serializeTool(record)),
        mostClicked: mostClickedRecords.map((record) => serializeTool(record)),
        mostCompared: mostComparedRecords.map((record) => serializeTool(record)),
        trending: trendingTools
      },
      topCategories,
      series: Array.from(seriesMap.values()),
      recentPayments: recentPayments.map((record) => {
        const tool = paymentToolsById.get(String(record.toolId));

        return {
          id: String(record._id),
          toolName: tool?.name ?? "Unknown tool",
          toolSlug: tool?.slug ?? null,
          purchaserEmail: record.purchaserEmail ?? null,
          amountTotal: record.amountTotal,
          currency: record.currency,
          featuredUntil:
            record.featuredUntil instanceof Date
              ? record.featuredUntil.toISOString()
              : record.featuredUntil
                ? new Date(record.featuredUntil).toISOString()
                : null,
          createdAt:
            record.createdAt instanceof Date
              ? record.createdAt.toISOString()
              : new Date(record.createdAt ?? Date.now()).toISOString()
        };
      })
    };
  }
}
