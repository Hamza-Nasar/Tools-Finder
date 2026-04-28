import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    appUserId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    plan: {
      type: String,
      enum: ["free", "pro", "vendor"],
      default: "free"
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null
    },
    stripeCustomerId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
      trim: true,
      index: true
    },
    trialEndsAt: {
      type: Date,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    passwordHash: {
      type: String,
      default: null,
      select: false
    },
    emailVerified: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    lastLoginProvider: {
      type: String,
      enum: ["credentials", "google", null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ plan: 1, createdAt: -1 });

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const UserModel = models.User || model("User", UserSchema);
