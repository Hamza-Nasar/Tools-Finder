import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const ToolSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    tagline: {
      type: String,
      required: true,
      trim: true
    },
    description: {
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
    logo: {
      type: String,
      default: null
    },
    screenshots: {
      type: [String],
      default: []
    },
    pricing: {
      type: String,
      enum: ["Free", "Freemium", "Paid"],
      required: true
    },
    loginRequired: {
      type: Boolean,
      default: null
    },
    skillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: null
    },
    platforms: {
      type: [String],
      enum: ["Web", "Chrome Extension", "iOS", "Android", "Desktop"],
      default: []
    },
    outputTypes: {
      type: [String],
      enum: ["Text", "Image", "PDF", "Video", "Code", "Audio"],
      default: []
    },
    bestFor: {
      type: [String],
      default: []
    },
    verifiedListing: {
      type: Boolean,
      default: false
    },
    lastCheckedAt: {
      type: Date,
      default: null
    },
    featured: {
      type: Boolean,
      default: false
    },
    trendingScore: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    favoritesCount: {
      type: Number,
      default: 0
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    clicksCount: {
      type: Number,
      default: 0
    },
    comparisonClicksCount: {
      type: Number,
      default: 0
    },
    latestFavoriteAt: {
      type: Date,
      default: null
    },
    latestViewAt: {
      type: Date,
      default: null
    },
    latestClickAt: {
      type: Date,
      default: null
    },
    featuredUntil: {
      type: Date,
      default: null
    },
    featureSource: {
      type: String,
      enum: ["manual", "stripe"],
      default: null
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "pending"
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    sourceSubmission: {
      type: Types.ObjectId,
      ref: "Submission",
      default: null
    }
  },
  {
    timestamps: true
  }
);

ToolSchema.index({ status: 1, featured: -1, createdAt: -1 });
ToolSchema.index({ status: 1, categorySlug: 1, trendingScore: -1, createdAt: -1 });
ToolSchema.index({ status: 1, tags: 1 });
ToolSchema.index({ status: 1, pricing: 1, createdAt: -1 });
ToolSchema.index({ status: 1, loginRequired: 1, skillLevel: 1, createdAt: -1 });
ToolSchema.index({ websiteDomain: 1, status: 1, createdAt: -1 });
ToolSchema.index({ status: 1, trendingScore: -1, favoritesCount: -1, viewsCount: -1, createdAt: -1 });
ToolSchema.index({ status: 1, favoritesCount: -1, latestFavoriteAt: -1, createdAt: -1 });
ToolSchema.index({ status: 1, viewsCount: -1, latestViewAt: -1, createdAt: -1 });
ToolSchema.index({ status: 1, clicksCount: -1, latestClickAt: -1, createdAt: -1 });
ToolSchema.index({ status: 1, comparisonClicksCount: -1, clicksCount: -1, createdAt: -1 });
ToolSchema.index({ featured: 1, featuredUntil: 1, featureSource: 1 });
ToolSchema.index({
  name: "text",
  tagline: "text",
  description: "text",
  tags: "text",
  categoryName: "text"
}, {
  weights: {
    name: 10,
    tagline: 6,
    tags: 5,
    categoryName: 4,
    description: 2
  },
  name: "tool_text_search"
});

export type ToolDocument = InferSchemaType<typeof ToolSchema>;

export const ToolModel = models.Tool || model("Tool", ToolSchema);
