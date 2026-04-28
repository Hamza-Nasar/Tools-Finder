import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const AlertRuleSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: ["price_change", "new_alternative", "score_drop"],
      required: true
    },
    thresholdPercent: {
      type: Number,
      default: null
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

AlertRuleSchema.index({ userId: 1, type: 1, toolId: 1 }, { unique: true });

export type AlertRuleDocument = InferSchemaType<typeof AlertRuleSchema>;

export const AlertRuleModel = models.AlertRule || model("AlertRule", AlertRuleSchema);
