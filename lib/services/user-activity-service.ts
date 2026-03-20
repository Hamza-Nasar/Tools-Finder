import { connectToDatabase } from "@/lib/mongodb";
import { toObjectId } from "@/lib/object-id";
import { serializeUserActivity } from "@/lib/serializers/user-activity";
import { SubmissionModel } from "@/models/Submission";
import { ToolModel } from "@/models/Tool";
import { UserActivityModel } from "@/models/UserActivity";

const TOOL_VIEW_DEDUP_WINDOW_MS = 1000 * 60 * 60 * 12;

export class UserActivityService {
  static async listActivitiesForUser(userId: string, limit = 12) {
    await connectToDatabase();

    const records = await UserActivityModel.find({
      userId: toObjectId(userId, "userId")
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return records.map((record) => serializeUserActivity(record));
  }

  static async recordToolSaved(userId: string, toolId: string) {
    await connectToDatabase();

    const tool = await ToolModel.findById(toObjectId(toolId, "toolId"))
      .select({ _id: 1, name: 1, slug: 1 })
      .lean<{ _id: { toString(): string }; name: string; slug: string } | null>();

    if (!tool) {
      return;
    }

    await UserActivityModel.create({
      userId: toObjectId(userId, "userId"),
      kind: "tool_saved",
      toolId: tool._id,
      toolName: tool.name,
      toolSlug: tool.slug
    });
  }

  static async recordToolSubmitted(userId: string, submissionId: string) {
    await connectToDatabase();

    const submission = await SubmissionModel.findById(toObjectId(submissionId, "submissionId"))
      .select({ _id: 1, name: 1, slug: 1 })
      .lean<{ _id: { toString(): string }; name: string; slug: string } | null>();

    if (!submission) {
      return;
    }

    await UserActivityModel.create({
      userId: toObjectId(userId, "userId"),
      kind: "tool_submitted",
      submissionId: submission._id,
      submissionName: submission.name,
      submissionSlug: submission.slug
    });
  }

  static async recordToolViewed(userId: string, toolId: string) {
    await connectToDatabase();

    const userIdObject = toObjectId(userId, "userId");
    const toolIdObject = toObjectId(toolId, "toolId");
    const viewCutoff = new Date(Date.now() - TOOL_VIEW_DEDUP_WINDOW_MS);
    const existing = await UserActivityModel.findOne({
      userId: userIdObject,
      toolId: toolIdObject,
      kind: "tool_viewed",
      createdAt: { $gte: viewCutoff }
    })
      .select({ _id: 1 })
      .lean();

    if (existing) {
      return;
    }

    const tool = await ToolModel.findById(toolIdObject)
      .select({ _id: 1, name: 1, slug: 1 })
      .lean<{ _id: { toString(): string }; name: string; slug: string } | null>();

    if (!tool) {
      return;
    }

    await UserActivityModel.create({
      userId: userIdObject,
      kind: "tool_viewed",
      toolId: tool._id,
      toolName: tool.name,
      toolSlug: tool.slug
    });
  }
}
