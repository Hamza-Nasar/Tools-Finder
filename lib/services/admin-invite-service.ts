import { createHash, randomBytes } from "crypto";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { EmailService } from "@/lib/services/email-service";
import { UserService } from "@/lib/services/user-service";
import { AdminInviteModel } from "@/models/AdminInvite";

interface AdminInviteRecord {
  _id: Types.ObjectId;
  email: string;
  name?: string | null;
  tokenHash: string;
  invitedByUserId: string;
  invitedByEmail: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  acceptedByUserId?: string | null;
  revokedAt?: Date | null;
  createdAt?: Date;
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function serializeInvite(invite: AdminInviteRecord) {
  return {
    id: invite._id.toString(),
    email: invite.email,
    name: invite.name ?? null,
    invitedByEmail: invite.invitedByEmail,
    expiresAt: invite.expiresAt.toISOString(),
    acceptedAt: invite.acceptedAt?.toISOString?.() ?? null,
    revokedAt: invite.revokedAt?.toISOString?.() ?? null,
    createdAt: invite.createdAt?.toISOString?.() ?? invite._id.getTimestamp().toISOString()
  };
}

function ensureInviteIsActive(invite: AdminInviteRecord | null) {
  if (!invite) {
    throw new AppError(404, "Admin invite is invalid or expired.", "INVITE_NOT_FOUND");
  }

  if (invite.revokedAt) {
    throw new AppError(410, "This admin invite has been revoked.", "INVITE_REVOKED");
  }

  if (invite.acceptedAt) {
    throw new AppError(410, "This admin invite has already been used.", "INVITE_USED");
  }

  if (invite.expiresAt.getTime() <= Date.now()) {
    throw new AppError(410, "This admin invite has expired.", "INVITE_EXPIRED");
  }

  return invite;
}

export class AdminInviteService {
  private static buildInviteUrl(baseUrl: string, token: string) {
    const url = new URL("/auth/admin-invite", baseUrl);
    url.searchParams.set("token", token);
    return url.toString();
  }

  private static async findActiveInviteByToken(token: string) {
    await connectToDatabase();

    const tokenHash = hashToken(token);
    const invite = await AdminInviteModel.findOne({ tokenHash }).lean<AdminInviteRecord | null>();

    return ensureInviteIsActive(invite);
  }

  static async createInvite(input: {
    email: string;
    name?: string | null;
    invitedByUserId: string;
    invitedByEmail: string;
    baseUrl: string;
  }) {
    await connectToDatabase();

    const email = normalizeEmail(input.email);
    const name = input.name?.trim() || null;
    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AdminInviteModel.updateMany(
      {
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          revokedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    const invite = await AdminInviteModel.create({
      email,
      name,
      tokenHash,
      invitedByUserId: input.invitedByUserId,
      invitedByEmail: normalizeEmail(input.invitedByEmail),
      expiresAt
    });
    const inviteUrl = this.buildInviteUrl(input.baseUrl, token);
    const emailResult = await EmailService.sendAdminInviteEmail({
      to: email,
      invitedByEmail: input.invitedByEmail,
      inviteUrl,
      expiresAt: expiresAt.toISOString()
    });

    return {
      invite: serializeInvite(invite),
      inviteUrl,
      delivered: emailResult.delivered
    };
  }

  static async listPendingInvites() {
    await connectToDatabase();

    const invites = await AdminInviteModel.find({
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean<AdminInviteRecord[]>();

    return invites.map((invite) => serializeInvite(invite));
  }

  static async getInvitePreview(token: string) {
    const invite = await this.findActiveInviteByToken(token);

    return serializeInvite(invite);
  }

  static async revokeInvite(input: { inviteId: string }) {
    await connectToDatabase();

    if (!Types.ObjectId.isValid(input.inviteId)) {
      throw new AppError(400, "Invalid invite identifier.", "INVALID_INVITE_ID");
    }

    const invite = await AdminInviteModel.findById(input.inviteId).lean<AdminInviteRecord | null>();

    if (!invite) {
      throw new AppError(404, "Admin invite not found.", "INVITE_NOT_FOUND");
    }

    if (!invite.acceptedAt && !invite.revokedAt) {
      await AdminInviteModel.collection.updateOne(
        { _id: invite._id },
        {
          $set: {
            revokedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    }
  }

  static async acceptInvite(input: {
    token: string;
    name?: string | null;
    password?: string | null;
    sessionUser?: {
      id: string;
      email?: string | null;
      name?: string | null;
    } | null;
  }) {
    const invite = await this.findActiveInviteByToken(input.token);
    const sessionEmail = input.sessionUser?.email ? normalizeEmail(input.sessionUser.email) : null;

    if (sessionEmail && sessionEmail !== invite.email) {
      throw new AppError(403, "Sign in with the invited email address to accept this admin invite.", "INVITE_EMAIL_MISMATCH");
    }

    if (!sessionEmail && !input.password) {
      throw new AppError(400, "Password is required to accept this admin invite.", "PASSWORD_REQUIRED");
    }

    const user = await UserService.createManagedUser({
      name: input.name ?? input.sessionUser?.name ?? invite.name ?? null,
      email: invite.email,
      password: input.password ?? null,
      role: "admin"
    });

    await AdminInviteModel.collection.updateOne(
      { _id: invite._id },
      {
        $set: {
          acceptedAt: new Date(),
          acceptedByUserId: user.id,
          updatedAt: new Date()
        }
      }
    );

    return {
      user
    };
  }
}
