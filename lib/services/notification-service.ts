import { connectToDatabase } from "@/lib/mongodb";
import { toObjectId } from "@/lib/object-id";
import { serializeNotification } from "@/lib/serializers/notification";
import { NotificationModel } from "@/models/Notification";

export class NotificationService {
  static async listNotificationsForUser(userId: string, limit = 8) {
    await connectToDatabase();

    const records = await NotificationModel.find({
      userId: toObjectId(userId, "userId")
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return records.map((record) => serializeNotification(record));
  }

  static async countUnreadForUser(userId: string) {
    await connectToDatabase();

    return NotificationModel.countDocuments({
      userId: toObjectId(userId, "userId"),
      readAt: null
    });
  }

  static async createNotification(input: {
    userId: string;
    kind: "submission_received" | "submission_approved" | "submission_rejected" | "featured_listing_activated";
    title: string;
    message: string;
    href?: string | null;
  }) {
    await connectToDatabase();

    await NotificationModel.create({
      userId: toObjectId(input.userId, "userId"),
      kind: input.kind,
      title: input.title,
      message: input.message,
      href: input.href ?? null
    });
  }

  static async markAllReadForUser(userId: string) {
    await connectToDatabase();

    await NotificationModel.updateMany(
      {
        userId: toObjectId(userId, "userId"),
        readAt: null
      },
      {
        $set: {
          readAt: new Date()
        }
      }
    );
  }
}
