import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const ReviewSchema = new Schema(
  {
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      required: true
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export type ReviewDocument = InferSchemaType<typeof ReviewSchema>;

export const ReviewModel = models.Review || model("Review", ReviewSchema);
