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
    image: {
      type: String,
      default: null
    },
    emailVerified: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

UserSchema.index({ role: 1, createdAt: -1 });

export type UserDocument = InferSchemaType<typeof UserSchema>;

export const UserModel = models.User || model("User", UserSchema);
