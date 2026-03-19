import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { toObjectId } from "@/lib/object-id";
import { serializeFavorite } from "@/lib/serializers/favorite";
import { serializeTool } from "@/lib/serializers/tool";
import { FavoriteModel } from "@/models/Favorite";
import { ToolModel } from "@/models/Tool";
import { ToolActivityService } from "@/lib/services/tool-activity-service";

export class FavoriteService {
  static async listFavoritesForUser(userId: string, options: { page: number; limit: number }) {
    await connectToDatabase();

    const skip = (options.page - 1) * options.limit;
    const query = { userId: toObjectId(userId, "userId") };
    const [records, total] = await Promise.all([
      FavoriteModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(options.limit).lean(),
      FavoriteModel.countDocuments(query)
    ]);

    const toolIds = records.map((record) => record.toolId);
    const tools = await ToolModel.find({
      _id: { $in: toolIds },
      status: "approved"
    }).lean();

    const toolsById = new Map(tools.map((tool) => [String(tool._id), serializeTool(tool)]));

    return {
      data: records
        .map((record) => ({
          favorite: serializeFavorite(record),
          tool: toolsById.get(record.toolId.toString())
        }))
        .filter(
          (
            record
          ): record is {
            favorite: ReturnType<typeof serializeFavorite>;
            tool: ReturnType<typeof serializeTool>;
          } => Boolean(record.tool)
        ),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async isFavorited(userId: string, toolId: string) {
    await connectToDatabase();

    const favorite = await FavoriteModel.findOne({
      userId: toObjectId(userId, "userId"),
      toolId: toObjectId(toolId, "toolId")
    })
      .select({ _id: 1 })
      .lean();

    return Boolean(favorite);
  }

  static async addFavorite(userId: string, toolId: string) {
    await connectToDatabase();

    const toolIdObject = toObjectId(toolId, "toolId");
    const userIdObject = toObjectId(userId, "userId");
    const tool = await ToolModel.findOne({
      _id: toolIdObject,
      status: "approved"
    })
      .select({ _id: 1 })
      .lean();

    if (!tool || Array.isArray(tool)) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    const writeResult = await FavoriteModel.updateOne(
      {
        userId: userIdObject,
        toolId: toolIdObject
      },
      {
        $setOnInsert: {
          userId: userIdObject,
          toolId: toolIdObject
        }
      },
      {
        upsert: true
      }
    );
    const favorite = await FavoriteModel.findOne({
      userId: userIdObject,
      toolId: toolIdObject
    }).lean();

    if (!favorite || Array.isArray(favorite)) {
      throw new AppError(500, "Unable to save favorite.", "FAVORITE_CREATE_FAILED");
    }

    if (writeResult.upsertedCount > 0) {
      await ToolActivityService.recordFavorite(toolIdObject);
    }

    return serializeFavorite(favorite);
  }

  static async removeFavorite(userId: string, toolId: string) {
    await connectToDatabase();

    const toolIdObject = toObjectId(toolId, "toolId");
    const favorite = await FavoriteModel.findOneAndDelete({
      userId: toObjectId(userId, "userId"),
      toolId: toolIdObject
    }).lean();

    if (favorite) {
      await ToolActivityService.decrementFavoriteCount(toolIdObject);
    }
  }
}
