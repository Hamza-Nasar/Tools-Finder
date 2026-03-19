import type { Session } from "next-auth";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { env } from "@/lib/env";
import { getMongoClient } from "@/lib/mongo-client";
import { UserModel } from "@/models/User";

declare global {
  var authUserCompatibilityPromise: Promise<void> | null | undefined;
}

interface SyncUserInput {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

interface AppUserRecord {
  _id: Types.ObjectId;
  appUserId?: string | null;
  userId?: string | null;
  name: string;
  email: string;
  image?: string | null;
  role: "user" | "admin";
  createdAt?: Date;
}

export class UserService {
  private static getDatabaseName() {
    return env.MONGODB_DB_NAME ?? "ai-tools-finder";
  }

  private static getStableAppUserId(record: Pick<AppUserRecord, "_id" | "appUserId" | "userId">) {
    return record.appUserId ?? record.userId ?? `usr_${record._id.toString()}`;
  }

  private static normalizeRole(input: SyncUserInput, existingRole?: "user" | "admin") {
    const normalizedEmail = input.email?.toLowerCase();
    const adminEmail = env.ADMIN_EMAIL?.toLowerCase();

    if (normalizedEmail && adminEmail && normalizedEmail === adminEmail) {
      return "admin" as const;
    }

    if (input.role === "admin" || existingRole === "admin") {
      return "admin" as const;
    }

    return "user" as const;
  }

  static async ensureAuthUserCompatibility() {
    if (global.authUserCompatibilityPromise) {
      return global.authUserCompatibilityPromise;
    }

    global.authUserCompatibilityPromise = (async () => {
      const client = await getMongoClient();
      const users = client.db(this.getDatabaseName()).collection("users");

      await users.updateMany(
        { userId: { $exists: true } },
        [
          {
            $set: {
              appUserId: {
                $ifNull: ["$appUserId", "$userId"]
              },
              updatedAt: "$$NOW"
            }
          },
          {
            $unset: "userId"
          }
        ]
      );
    })().catch((error) => {
      global.authUserCompatibilityPromise = null;
      throw error;
    });

    return global.authUserCompatibilityPromise;
  }

  static async syncUser(input: SyncUserInput) {
    await connectToDatabase();

    const normalizedEmail = input.email?.toLowerCase().trim();

    if (!normalizedEmail) {
      throw new AppError(401, "Authenticated user is missing an email address.", "INVALID_SESSION");
    }

    const normalizedName = input.name?.trim() || normalizedEmail.split("@")[0];
    const normalizedImage = input.image?.trim() || null;
    const existing =
      (input.id && Types.ObjectId.isValid(input.id) ? await UserModel.findById(input.id).lean<AppUserRecord | null>() : null) ??
      (await UserModel.findOne({ email: normalizedEmail }).lean<AppUserRecord | null>());
    const role = this.normalizeRole(input, existing?.role);

    if (!existing) {
      const createdUserId = `usr_${new Types.ObjectId().toString()}`;
      const created = await UserModel.create({
        appUserId: createdUserId,
        name: normalizedName,
        email: normalizedEmail,
        image: normalizedImage,
        role
      });

      return {
        id: created._id.toString(),
        userId: created.appUserId ?? createdUserId,
        name: created.name,
        email: created.email,
        image: created.image ?? null,
        role: created.role,
        createdAt: created.createdAt?.toISOString?.() ?? new Date().toISOString()
      };
    }

    const userId = this.getStableAppUserId(existing);
    const setUpdates: Record<string, unknown> = {};
    const unsetUpdates: Record<string, "" | 1> = {};

    if (existing.name !== normalizedName) {
      setUpdates.name = normalizedName;
    }

    if (existing.email !== normalizedEmail) {
      setUpdates.email = normalizedEmail;
    }

    if ((existing.image ?? null) !== normalizedImage) {
      setUpdates.image = normalizedImage;
    }

    if (existing.role !== role) {
      setUpdates.role = role;
    }

    if (!existing.appUserId) {
      setUpdates.appUserId = userId;
    }

    if (existing.userId) {
      unsetUpdates.userId = "";
    }

    if (!existing.createdAt) {
      setUpdates.createdAt = existing._id.getTimestamp();
    }

    if (Object.keys(setUpdates).length > 0 || Object.keys(unsetUpdates).length > 0) {
      const updateOperation: Record<string, unknown> = {};

      if (Object.keys(setUpdates).length > 0) {
        updateOperation.$set = {
          ...setUpdates,
          updatedAt: new Date()
        };
      }

      if (Object.keys(unsetUpdates).length > 0) {
        updateOperation.$unset = unsetUpdates;
      }

      await UserModel.collection.updateOne({ _id: existing._id }, updateOperation);
    }

    return {
      id: existing._id.toString(),
      userId,
      name: (setUpdates.name as string | undefined) ?? existing.name,
      email: normalizedEmail,
      image: (setUpdates.image as string | null | undefined) ?? (existing.image ?? null),
      role,
      createdAt:
        (setUpdates.createdAt as Date | undefined)?.toISOString?.() ??
        existing.createdAt?.toISOString?.() ??
        existing._id.getTimestamp().toISOString()
    };
  }

  static async syncSessionUser(session: Session) {
    return this.syncUser({
      id: session.user?.id ?? null,
      name: session.user?.name ?? null,
      email: session.user?.email ?? null,
      image: session.user?.image ?? null,
      role: session.user?.role ?? null
    });
  }

  static async listUsers(options: { page: number; limit: number; role?: "user" | "admin"; q?: string }) {
    await connectToDatabase();

    const filter: Record<string, unknown> = {};

    if (options.role) {
      filter.role = options.role;
    }

    if (options.q) {
      const pattern = new RegExp(options.q, "i");
      filter.$or = [{ name: pattern }, { email: pattern }];
    }

    const skip = (options.page - 1) * options.limit;
    const [records, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit).lean<AppUserRecord[]>(),
      UserModel.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => ({
        id: String(record._id),
        userId: this.getStableAppUserId(record),
        name: record.name,
        email: record.email,
        image: record.image ?? null,
        role: record.role,
        createdAt: record.createdAt?.toISOString?.() ?? ""
      })),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }
}
