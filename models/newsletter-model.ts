import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const NewsletterSubscriptionSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active"
    },
    sources: {
      type: [String],
      default: []
    },
    pagePaths: {
      type: [String],
      default: []
    },
    toolSlugs: {
      type: [String],
      default: []
    },
    signupCount: {
      type: Number,
      default: 1
    },
    lastSubscribedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

NewsletterSubscriptionSchema.index({ email: 1 }, { unique: true });
NewsletterSubscriptionSchema.index({ status: 1, lastSubscribedAt: -1 });

export type NewsletterSubscriptionDocument = InferSchemaType<typeof NewsletterSubscriptionSchema>;

export const NewsletterSubscriptionModel =
  models.NewsletterSubscription || model("NewsletterSubscription", NewsletterSubscriptionSchema);
