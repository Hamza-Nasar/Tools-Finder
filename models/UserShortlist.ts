import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const UserShortlistSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    query: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320
    },
    inferredCategories: {
      type: [String],
      default: []
    },
    inferredTags: {
      type: [String],
      default: []
    },
    toolIds: {
      type: [Types.ObjectId],
      ref: "Tool",
      default: []
    },
    shareSlug: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

UserShortlistSchema.index({ userId: 1, updatedAt: -1 });

export type UserShortlistDocument = InferSchemaType<typeof UserShortlistSchema>;

export const UserShortlistModel = models.UserShortlist || model("UserShortlist", UserShortlistSchema);
