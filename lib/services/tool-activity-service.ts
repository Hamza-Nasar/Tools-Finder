import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { toObjectId } from "@/lib/object-id";
import { ToolActivityModel } from "@/models/ToolActivity";
import { ToolModel } from "@/models/Tool";

const VIEW_TREND_WEIGHT = 0.75;
const FAVORITE_TREND_WEIGHT = 6;
const CLICK_TREND_WEIGHT = 2.5;
const NEW_TOOL_TREND_WINDOW_DAYS = 30;
const TRENDING_ACTIVITY_WINDOW_DAYS = 14;
const RECENT_ACTIVITY_LOOKBACK_DAYS = 7;

type ObjectId = mongoose.Types.ObjectId;

function toToolObjectId(toolId: string | ObjectId) {
  return typeof toolId === "string" ? toObjectId(toolId, "toolId") : toolId;
}

function getBucketDate(date = new Date()) {
  const bucketDate = new Date(date);
  bucketDate.setUTCHours(0, 0, 0, 0);
  return bucketDate;
}

function getCutoffDate(days: number) {
  const cutoff = getBucketDate();
  cutoff.setUTCDate(cutoff.getUTCDate() - Math.max(days - 1, 0));
  return cutoff;
}

function getRecencyBoost(createdAt: Date | string) {
  const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const ageMs = Date.now() - createdAtDate.getTime();
  const ageDays = Math.max(ageMs / (1000 * 60 * 60 * 24), 0);

  return Math.max(0, NEW_TOOL_TREND_WINDOW_DAYS - ageDays) * 1.2;
}

export class ToolActivityService {
  static async recordView(toolId: string | ObjectId) {
    await connectToDatabase();

    const objectId = toToolObjectId(toolId);
    const now = new Date();
    const bucketDate = getBucketDate(now);

    await Promise.all([
      ToolActivityModel.updateOne(
        { toolId: objectId, bucketDate },
        {
          $setOnInsert: { toolId: objectId, bucketDate },
          $inc: { views: 1 }
        },
        { upsert: true }
      ),
      ToolModel.updateOne(
        { _id: objectId },
        {
          $inc: {
            viewsCount: 1,
            trendingScore: VIEW_TREND_WEIGHT
          },
          $set: { latestViewAt: now }
        }
      )
    ]);
  }

  static async recordClick(toolId: string | ObjectId) {
    await connectToDatabase();

    const objectId = toToolObjectId(toolId);
    const now = new Date();
    const bucketDate = getBucketDate(now);

    await Promise.all([
      ToolActivityModel.updateOne(
        { toolId: objectId, bucketDate },
        {
          $setOnInsert: { toolId: objectId, bucketDate },
          $inc: { clicks: 1 }
        },
        { upsert: true }
      ),
      ToolModel.updateOne(
        { _id: objectId },
        {
          $inc: {
            clicksCount: 1,
            trendingScore: CLICK_TREND_WEIGHT
          },
          $set: { latestClickAt: now }
        }
      )
    ]);
  }

  static async recordFavorite(toolId: string | ObjectId) {
    await connectToDatabase();

    const objectId = toToolObjectId(toolId);
    const now = new Date();
    const bucketDate = getBucketDate(now);

    await Promise.all([
      ToolActivityModel.updateOne(
        { toolId: objectId, bucketDate },
        {
          $setOnInsert: { toolId: objectId, bucketDate },
          $inc: { favorites: 1 }
        },
        { upsert: true }
      ),
      ToolModel.updateOne(
        { _id: objectId },
        {
          $inc: {
            favoritesCount: 1,
            trendingScore: FAVORITE_TREND_WEIGHT
          },
          $set: { latestFavoriteAt: now }
        }
      )
    ]);
  }

  static async decrementFavoriteCount(toolId: string | ObjectId) {
    await connectToDatabase();

    const objectId = toToolObjectId(toolId);

    await ToolModel.updateOne(
      { _id: objectId },
      [
        {
          $set: {
            favoritesCount: {
              $max: [{ $subtract: ["$favoritesCount", 1] }, 0]
            }
          }
        }
      ]
    );
  }

  static async listTrendingToolIds(limit = 12) {
    await connectToDatabase();

    const activityCutoff = getCutoffDate(TRENDING_ACTIVITY_WINDOW_DAYS);
    const recencyCutoff = getCutoffDate(RECENT_ACTIVITY_LOOKBACK_DAYS);

    return ToolActivityModel.aggregate<{
      toolId: ObjectId;
      recentViews: number;
      recentFavorites: number;
      recentClicks: number;
      recentViews7d: number;
      recentFavorites7d: number;
      activityScore: number;
    }>([
      {
        $match: {
          bucketDate: { $gte: activityCutoff }
        }
      },
      {
        $group: {
          _id: "$toolId",
          recentViews: { $sum: "$views" },
          recentFavorites: { $sum: "$favorites" },
          recentClicks: { $sum: "$clicks" },
          recentViews7d: {
            $sum: {
              $cond: [{ $gte: ["$bucketDate", recencyCutoff] }, "$views", 0]
            }
          },
          recentFavorites7d: {
            $sum: {
              $cond: [{ $gte: ["$bucketDate", recencyCutoff] }, "$favorites", 0]
            }
          }
        }
      },
      {
        $addFields: {
          activityScore: {
            $add: [
              { $multiply: ["$recentFavorites", FAVORITE_TREND_WEIGHT] },
              { $multiply: ["$recentViews", VIEW_TREND_WEIGHT] },
              { $multiply: [{ $ifNull: ["$recentClicks", 0] }, CLICK_TREND_WEIGHT] },
              { $multiply: ["$recentFavorites7d", 2] },
              { $multiply: ["$recentViews7d", 0.5] }
            ]
          }
        }
      },
      { $sort: { activityScore: -1, recentFavorites: -1, recentViews: -1 } },
      { $limit: Math.max(limit * 4, 12) },
      {
        $project: {
          _id: 0,
          toolId: "$_id",
          recentViews: 1,
          recentFavorites: 1,
          recentClicks: 1,
          recentViews7d: 1,
          recentFavorites7d: 1,
          activityScore: 1
        }
      }
    ]);
  }

  static async listTrendingToolIdsForDate(date = new Date(), limit = 12) {
    await connectToDatabase();

    const bucketDate = getBucketDate(date);
    const records = await ToolActivityModel.find(
      {
        bucketDate
      },
      {
        toolId: 1,
        views: 1,
        favorites: 1,
        clicks: 1
      }
    )
      .sort({ favorites: -1, views: -1, clicks: -1 })
      .limit(Math.max(limit * 4, 12))
      .lean();

    return records
      .map((record) => ({
        toolId: record.toolId,
        recentViews: Number(record.views ?? 0),
        recentFavorites: Number(record.favorites ?? 0),
        recentClicks: Number(record.clicks ?? 0),
        activityScore:
          Number(record.favorites ?? 0) * FAVORITE_TREND_WEIGHT +
          Number(record.views ?? 0) * VIEW_TREND_WEIGHT +
          Number(record.clicks ?? 0) * CLICK_TREND_WEIGHT
      }))
      .sort((left, right) => right.activityScore - left.activityScore);
  }

  static getBucketDate(date = new Date()) {
    return getBucketDate(date);
  }

  static getRecencyBoost(createdAt: Date | string) {
    return getRecencyBoost(createdAt);
  }
}
