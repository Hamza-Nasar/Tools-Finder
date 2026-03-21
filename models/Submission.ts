import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const SubmissionSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    tagline: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      required: true,
      trim: true
    },
    websiteDomain: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    affiliateUrl: {
      type: String,
      default: null
    },
    launchYear: {
      type: Number,
      default: null,
      min: 1990,
      max: new Date().getFullYear()
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: Types.ObjectId,
      ref: "Category",
      required: true
    },
    categoryName: {
      type: String,
      required: true,
      trim: true
    },
    categorySlug: {
      type: String,
      required: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    pricing: {
      type: String,
      enum: ["Free", "Freemium", "Paid"],
      required: true
    },
    logo: {
      type: String,
      default: null
    },
    screenshots: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    moderationNote: {
      type: String,
      default: null
    },
    submittedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null
    },
    contactEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true
    },
    moderatedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null
    },
    approvedTool: {
      type: Types.ObjectId,
      ref: "Tool",
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

SubmissionSchema.index({ slug: 1, createdAt: -1 });
SubmissionSchema.index({ status: 1, createdAt: -1 });
SubmissionSchema.index({ categorySlug: 1, status: 1, createdAt: -1 });
SubmissionSchema.index({ websiteDomain: 1, status: 1, createdAt: -1 });

export type SubmissionDocument = InferSchemaType<typeof SubmissionSchema>;

export const SubmissionModel = models.Submission || model("Submission", SubmissionSchema);
