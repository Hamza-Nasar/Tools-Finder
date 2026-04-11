import type { Session } from "next-auth";
import { compare, hash } from "bcryptjs";
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
  loginProvider?: "credentials" | "google" | null;
}

interface AppUserRecord {
  _id: Types.ObjectId;
  appUserId?: string | null;
  userId?: string | null;
  name: string;
  email: string;
  image?: string | null;
  role: "user" | "admin";
  passwordHash?: string | null;
  lastLoginAt?: Date | null;
  lastLoginProvider?: "credentials" | "google" | null;
  createdAt?: Date;
}

export class UserService {
  private static getDatabaseName() {
    return env.MONGODB_DB_NAME ?? "aitoolsfinder";
  }

  private static getStableAppUserId(record: Pick<AppUserRecord, "_id" | "appUserId" | "userId">) {
    return record.appUserId ?? record.userId ?? `usr_${record._id.toString()}`;
  }

  private static getBootstrapAdminEmails() {
    return [
      env.ADMIN_EMAIL,
      ...(env.ADMIN_EMAILS?.split(",") ?? [])
    ]
      .map((email) => email?.toLowerCase().trim())
      .filter((email): email is string => Boolean(email));
  }

  private static isBootstrapAdminEmail(email?: string | null) {
    const normalizedEmail = this.normalizeEmail(email);

    return Boolean(normalizedEmail && this.getBootstrapAdminEmails().includes(normalizedEmail));
  }

  private static normalizeRole(input: SyncUserInput, existingRole?: "user" | "admin") {
    if (this.isBootstrapAdminEmail(input.email)) {
      return "admin" as const;
    }

    if (input.role === "admin" || existingRole === "admin") {
      return "admin" as const;
    }

    return "user" as const;
  }

  private static normalizeEmail(email?: string | null) {
    return email?.toLowerCase().trim() ?? "";
  }

  private static buildDefaultName(email: string) {
    return email.split("@")[0];
  }

  private static serializeUser(record: AppUserRecord) {
    return {
      id: record._id.toString(),
      userId: this.getStableAppUserId(record),
      name: record.name,
      email: record.email,
      image: record.image ?? null,
      role: record.role,
      passwordConfigured: Boolean(record.passwordHash),
      lastLoginAt: record.lastLoginAt?.toISOString?.() ?? null,
      lastLoginProvider: record.lastLoginProvider ?? null,
      createdAt: record.createdAt?.toISOString?.() ?? record._id.getTimestamp().toISOString()
    };
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

    const normalizedEmail = this.normalizeEmail(input.email);

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
        role,
        ...(input.loginProvider
          ? {
              lastLoginAt: new Date(),
              lastLoginProvider: input.loginProvider
            }
          : {})
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

    if (input.loginProvider) {
      setUpdates.lastLoginAt = new Date();
      setUpdates.lastLoginProvider = input.loginProvider;
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

  static async registerWithPassword(input: { name?: string | null; email: string; password: string }) {
    await connectToDatabase();

    const normalizedEmail = this.normalizeEmail(input.email);

    if (!normalizedEmail) {
      throw new AppError(400, "A valid email address is required.", "INVALID_EMAIL");
    }

    if (this.isBootstrapAdminEmail(normalizedEmail)) {
      throw new AppError(
        409,
        "This email is reserved for an admin account. Ask an existing admin to create it from the admin panel.",
        "ADMIN_EMAIL_RESERVED"
      );
    }

    const existing = await UserModel.findOne({ email: normalizedEmail })
      .select("+passwordHash")
      .lean<AppUserRecord | null>();

    if (existing?.passwordHash) {
      throw new AppError(409, "An account with this email already exists. Log in instead.", "EMAIL_IN_USE");
    }

    if (existing && !existing.passwordHash) {
      throw new AppError(
        409,
        "This email is already associated with a Google account. Continue with Google instead.",
        "OAUTH_ACCOUNT_EXISTS"
      );
    }

    const createdUserId = `usr_${new Types.ObjectId().toString()}`;
    const passwordHash = await hash(input.password, 12);
    const normalizedName = input.name?.trim() || this.buildDefaultName(normalizedEmail);
    const role = this.normalizeRole({ email: normalizedEmail, name: normalizedName }, undefined);
    const created = await UserModel.create({
      appUserId: createdUserId,
      name: normalizedName,
      email: normalizedEmail,
      image: null,
      role,
      passwordHash
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

  static async authenticateWithPassword(input: { email: string; password: string }) {
    await connectToDatabase();

    const normalizedEmail = this.normalizeEmail(input.email);

    if (!normalizedEmail || !input.password) {
      throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    const adminEmail = env.ADMIN_EMAIL?.toLowerCase();

    if (adminEmail && env.ADMIN_PASSWORD_HASH && normalizedEmail === adminEmail) {
      const isAdminPasswordValid = await compare(input.password, env.ADMIN_PASSWORD_HASH);

      if (isAdminPasswordValid) {
        return this.syncUser({
          name: this.buildDefaultName(normalizedEmail),
          email: normalizedEmail,
          image: null,
          role: "admin",
          loginProvider: "credentials"
        });
      }
    }

    const user = await UserModel.findOne({ email: normalizedEmail })
      .select("+passwordHash")
      .lean<AppUserRecord | null>();

    if (!user?.passwordHash) {
      throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    const role = this.isBootstrapAdminEmail(user.email) ? "admin" : user.role;

    await UserModel.collection.updateOne(
      { _id: user._id },
      {
        $set: {
          role,
          lastLoginAt: new Date(),
          lastLoginProvider: "credentials",
          updatedAt: new Date()
        }
      }
    );

    return {
      id: user._id.toString(),
      userId: this.getStableAppUserId(user),
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role,
      createdAt: user.createdAt?.toISOString?.() ?? user._id.getTimestamp().toISOString()
    };
  }

  static async refreshSessionUser(input: { id?: string | null; email?: string | null }) {
    await connectToDatabase();

    const normalizedEmail = this.normalizeEmail(input.email);
    const existing =
      (input.id && Types.ObjectId.isValid(input.id) ? await UserModel.findById(input.id).lean<AppUserRecord | null>() : null) ??
      (normalizedEmail ? await UserModel.findOne({ email: normalizedEmail }).lean<AppUserRecord | null>() : null);

    if (!existing) {
      return null;
    }

    const role = this.isBootstrapAdminEmail(existing.email) ? "admin" : existing.role;

    if (role !== existing.role) {
      await UserModel.collection.updateOne(
        { _id: existing._id },
        {
          $set: {
            role,
            updatedAt: new Date()
          }
        }
      );
    }

    return {
      id: existing._id.toString(),
      userId: this.getStableAppUserId(existing),
      name: existing.name,
      email: existing.email,
      image: existing.image ?? null,
      role,
      createdAt: existing.createdAt?.toISOString?.() ?? existing._id.getTimestamp().toISOString()
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
      UserModel.find(filter)
        .select("+passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .lean<AppUserRecord[]>(),
      UserModel.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => this.serializeUser(record)),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async hasAdminAccount() {
    await connectToDatabase();

    return (await UserModel.countDocuments({ role: "admin" })) > 0;
  }

  static async setupFirstAdmin(input: { name: string; email: string; password: string; allowRecovery?: boolean }) {
    await connectToDatabase();

    const hasAdmin = await this.hasAdminAccount();

    if (hasAdmin && !input.allowRecovery) {
      throw new AppError(409, "First admin setup is already complete.", "ADMIN_SETUP_CLOSED");
    }

    return this.createManagedUser({
      name: input.name,
      email: input.email,
      password: input.password,
      role: "admin"
    });
  }

  static async createManagedUser(input: {
    name?: string | null;
    email: string;
    password?: string | null;
    role: "user" | "admin";
  }) {
    await connectToDatabase();

    const normalizedEmail = this.normalizeEmail(input.email);

    if (!normalizedEmail) {
      throw new AppError(400, "A valid email address is required.", "INVALID_EMAIL");
    }

    const normalizedName = input.name?.trim() || this.buildDefaultName(normalizedEmail);
    const existing = await UserModel.findOne({ email: normalizedEmail })
      .select("+passwordHash")
      .lean<AppUserRecord | null>();

    if (!existing && !input.password) {
      throw new AppError(400, "Password is required when creating a new account.", "PASSWORD_REQUIRED");
    }

    if (existing) {
      const setUpdates: Record<string, unknown> = {
        name: normalizedName,
        role: input.role,
        updatedAt: new Date()
      };

      if (!existing.appUserId) {
        setUpdates.appUserId = this.getStableAppUserId(existing);
      }

      if (input.password) {
        setUpdates.passwordHash = await hash(input.password, 12);
      }

      await UserModel.collection.updateOne({ _id: existing._id }, { $set: setUpdates });

      const updated = await UserModel.findById(existing._id)
        .select("+passwordHash")
        .lean<AppUserRecord | null>();

      if (!updated) {
        throw new AppError(404, "User could not be loaded after update.", "USER_NOT_FOUND");
      }

      return this.serializeUser(updated);
    }

    const password = input.password;

    if (!password) {
      throw new AppError(400, "Password is required when creating a new account.", "PASSWORD_REQUIRED");
    }

    const createdUserId = `usr_${new Types.ObjectId().toString()}`;
    const created = await UserModel.create({
      appUserId: createdUserId,
      name: normalizedName,
      email: normalizedEmail,
      image: null,
      role: input.role,
      passwordHash: await hash(password, 12)
    });

    return this.serializeUser({
      _id: created._id,
      appUserId: created.appUserId,
      name: created.name,
      email: created.email,
      image: created.image,
      role: created.role,
      passwordHash: created.passwordHash,
      lastLoginAt: created.lastLoginAt,
      lastLoginProvider: created.lastLoginProvider,
      createdAt: created.createdAt
    });
  }

  static async updateUserRole(input: { targetUserId: string; role: "user" | "admin"; actorUserId: string }) {
    await connectToDatabase();

    if (input.role === "admin") {
      throw new AppError(400, "Admin access must be granted through an invite link.", "ADMIN_INVITE_REQUIRED");
    }

    if (!Types.ObjectId.isValid(input.targetUserId)) {
      throw new AppError(400, "Invalid user identifier.", "INVALID_USER_ID");
    }

    if (input.targetUserId === input.actorUserId) {
      throw new AppError(400, "You cannot remove your own admin access.", "SELF_DEMOTION_BLOCKED");
    }

    const target = await UserModel.findById(input.targetUserId)
      .select("+passwordHash")
      .lean<AppUserRecord | null>();

    if (!target) {
      throw new AppError(404, "User not found.", "USER_NOT_FOUND");
    }

    if (this.isBootstrapAdminEmail(target.email)) {
      throw new AppError(400, "Bootstrap admin access is controlled by environment configuration.", "BOOTSTRAP_ADMIN_PROTECTED");
    }

    if (target.role === "admin") {
      const adminCount = await UserModel.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        throw new AppError(400, "At least one admin account must remain active.", "LAST_ADMIN_BLOCKED");
      }
    }

    if (target.role !== input.role) {
      await UserModel.collection.updateOne(
        { _id: target._id },
        {
          $set: {
            role: input.role,
            updatedAt: new Date()
          }
        }
      );
    }

    const updated = await UserModel.findById(target._id)
      .select("+passwordHash")
      .lean<AppUserRecord | null>();

    if (!updated) {
      throw new AppError(404, "User could not be loaded after update.", "USER_NOT_FOUND");
    }

    return this.serializeUser(updated);
  }
}
