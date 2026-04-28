import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { AlertRuleModel } from "@/models/AlertRule";
import { ToolModel } from "@/models/Tool";

type AlertType = "price_change" | "new_alternative" | "score_drop";

function toObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid identifier.", "INVALID_ID");
  }

  return new Types.ObjectId(id);
}

export class AlertService {
  static async listUserAlerts(userId: string) {
    await connectToDatabase();
    const userObjectId = toObjectId(userId);

    const records = await AlertRuleModel.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean<
        Array<{
          _id: Types.ObjectId;
          userId: Types.ObjectId;
          toolId?: Types.ObjectId | null;
          type: AlertType;
          thresholdPercent?: number | null;
          active: boolean;
          createdAt?: Date;
          updatedAt?: Date;
        }>
      >();

    return records.map((record) => ({
      id: record._id.toString(),
      userId: record.userId.toString(),
      toolId: record.toolId?.toString() ?? null,
      type: record.type,
      thresholdPercent: record.thresholdPercent ?? null,
      active: record.active,
      createdAt: record.createdAt?.toISOString() ?? null,
      updatedAt: record.updatedAt?.toISOString() ?? null
    }));
  }

  static async createAlert(input: {
    userId: string;
    toolSlug?: string | null;
    type: AlertType;
    thresholdPercent?: number | null;
  }) {
    await connectToDatabase();
    const userObjectId = toObjectId(input.userId);
    let toolObjectId: Types.ObjectId | null = null;

    if (input.toolSlug) {
      const tool = await ToolModel.findOne({ slug: input.toolSlug }, { _id: 1 }).lean<{ _id: Types.ObjectId } | null>();

      if (!tool) {
        throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
      }

      toolObjectId = tool._id;
    }

    const record = await AlertRuleModel.findOneAndUpdate(
      {
        userId: userObjectId,
        type: input.type,
        toolId: toolObjectId
      },
      {
        $set: {
          thresholdPercent: input.thresholdPercent ?? null,
          active: true
        },
        $setOnInsert: {
          userId: userObjectId,
          toolId: toolObjectId,
          type: input.type
        }
      },
      { upsert: true, new: true }
    ).lean<{
      _id: Types.ObjectId;
      userId: Types.ObjectId;
      toolId?: Types.ObjectId | null;
      type: AlertType;
      thresholdPercent?: number | null;
      active: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    }>();

    if (!record) {
      throw new AppError(500, "Alert could not be created.", "ALERT_CREATE_FAILED");
    }

    return {
      id: record._id.toString(),
      userId: record.userId.toString(),
      toolId: record.toolId?.toString() ?? null,
      type: record.type,
      thresholdPercent: record.thresholdPercent ?? null,
      active: record.active,
      createdAt: record.createdAt?.toISOString() ?? null,
      updatedAt: record.updatedAt?.toISOString() ?? null
    };
  }
}
