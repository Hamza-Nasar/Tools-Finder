import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const UserActivitySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    kind: {
      type: String,
      enum: ["tool_saved", "tool_submitted", "tool_viewed"],
      required: true
    },
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      default: null
    },
    submissionId: {
      type: Types.ObjectId,
      ref: "Submission",
      default: null
    },
    toolName: {
      type: String,
      default: null,
      trim: true
    },
    toolSlug: {
      type: String,
      default: null,
      trim: true
    },
    submissionName: {
      type: String,
      default: null,
      trim: true
    },
    submissionSlug: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

UserActivitySchema.index({ userId: 1, createdAt: -1 });
UserActivitySchema.index({ userId: 1, kind: 1, createdAt: -1 });
UserActivitySchema.index({ userId: 1, toolId: 1, kind: 1, createdAt: -1 });
UserActivitySchema.index({ userId: 1, submissionId: 1, kind: 1, createdAt: -1 });

export type UserActivityDocument = InferSchemaType<typeof UserActivitySchema>;

export const UserActivityModel = models.UserActivity || model("UserActivity", UserActivitySchema);
