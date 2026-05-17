import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const PaymentRecordSchema = new Schema(
  {
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      default: null
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      default: null
    },
    purpose: {
      type: String,
      enum: ["featured-listing", "plan-subscription"],
      default: "featured-listing",
      index: true
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
    stripeSubscriptionId: {
      type: String,
      default: null,
      index: true
    },
    plan: {
      type: String,
      enum: ["free", "pro", "vendor", null],
      default: null
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null
    },
    purchaserEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
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
PaymentRecordSchema.index({ userId: 1, createdAt: -1 });
PaymentRecordSchema.index({ status: 1, featuredUntil: -1 });
PaymentRecordSchema.index({ purpose: 1, status: 1, createdAt: -1 });

export type PaymentRecordDocument = InferSchemaType<typeof PaymentRecordSchema>;

export const PaymentRecordModel = models.PaymentRecord || model("PaymentRecord", PaymentRecordSchema);
