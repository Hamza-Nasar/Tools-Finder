import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const PaymentRecordSchema = new Schema(
  {
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      required: true
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    stripePaymentIntentId: {
      type: String,
      default: null
    },
    purchaserEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    planId: {
      type: String,
      default: "monthly",
      trim: true
    },
    planName: {
      type: String,
      default: "Monthly Boost",
      trim: true
    },
    durationDays: {
      type: Number,
      default: 30
    },
    amountTotal: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: "usd"
    },
    status: {
      type: String,
      enum: ["pending", "paid", "expired", "canceled"],
      default: "pending"
    },
    featuredFrom: {
      type: Date,
      default: null
    },
    featuredUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

PaymentRecordSchema.index({ toolId: 1, createdAt: -1 });
PaymentRecordSchema.index({ status: 1, featuredUntil: -1 });

export type PaymentRecordDocument = InferSchemaType<typeof PaymentRecordSchema>;

export const PaymentRecordModel = models.PaymentRecord || model("PaymentRecord", PaymentRecordSchema);
