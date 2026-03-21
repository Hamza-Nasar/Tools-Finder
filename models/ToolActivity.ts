import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const ToolActivitySchema = new Schema(
  {
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      required: true
    },
    bucketDate: {
      type: Date,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    comparisonClicks: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

ToolActivitySchema.index({ toolId: 1, bucketDate: 1 }, { unique: true });
ToolActivitySchema.index({ bucketDate: -1, favorites: -1 });
ToolActivitySchema.index({ bucketDate: -1, views: -1 });
ToolActivitySchema.index({ bucketDate: -1, clicks: -1 });
ToolActivitySchema.index({ bucketDate: -1, comparisonClicks: -1 });

export type ToolActivityDocument = InferSchemaType<typeof ToolActivitySchema>;

export const ToolActivityModel = models.ToolActivity || model("ToolActivity", ToolActivitySchema);
