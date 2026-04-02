import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const RateLimitWindowSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true
    },
    windowStart: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      required: true,
      default: 0
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    versionKey: false
  }
);

RateLimitWindowSchema.index({ key: 1, windowStart: 1 }, { unique: true });
RateLimitWindowSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitWindowDocument = InferSchemaType<typeof RateLimitWindowSchema>;

export const RateLimitWindowModel = models.RateLimitWindow || model("RateLimitWindow", RateLimitWindowSchema);
