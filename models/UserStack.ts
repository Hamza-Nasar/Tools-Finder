import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const UserStackSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "My AI Stack"
    },
    description: {
      type: String,
      default: null,
      trim: true
    },
    toolIds: {
      type: [Types.ObjectId],
      ref: "Tool",
      default: []
    }
  },
  {
    timestamps: true
  }
);

UserStackSchema.index({ updatedAt: -1 });

export type UserStackDocument = InferSchemaType<typeof UserStackSchema>;

export const UserStackModel = models.UserStack || model("UserStack", UserStackSchema);
