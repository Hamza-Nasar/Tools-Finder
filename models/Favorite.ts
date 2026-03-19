import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const FavoriteSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      required: true
    }
  },
  {
    timestamps: true
  }
);

FavoriteSchema.index({ userId: 1, toolId: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, createdAt: -1 });
FavoriteSchema.index({ toolId: 1, createdAt: -1 });

export type FavoriteDocument = InferSchemaType<typeof FavoriteSchema>;

export const FavoriteModel = models.Favorite || model("Favorite", FavoriteSchema);
