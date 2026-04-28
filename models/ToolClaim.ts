import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const ToolClaimSchema = new Schema(
  {
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      required: true,
      index: true
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    companyEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    message: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    moderationNote: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

ToolClaimSchema.index({ toolId: 1, userId: 1 }, { unique: true });

export type ToolClaimDocument = InferSchemaType<typeof ToolClaimSchema>;

export const ToolClaimModel = models.ToolClaim || model("ToolClaim", ToolClaimSchema);
