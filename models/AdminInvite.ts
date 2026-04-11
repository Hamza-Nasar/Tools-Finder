import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const AdminInviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      default: null,
      trim: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true
    },
    invitedByUserId: {
      type: String,
      required: true
    },
    invitedByEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    acceptedByUserId: {
      type: String,
      default: null
    },
    revokedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

AdminInviteSchema.index({ email: 1, createdAt: -1 });
AdminInviteSchema.index({ expiresAt: 1 });

export type AdminInviteDocument = InferSchemaType<typeof AdminInviteSchema>;

export const AdminInviteModel = models.AdminInvite || model("AdminInvite", AdminInviteSchema);
