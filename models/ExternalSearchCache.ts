import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const ExternalSearchResultSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    provider: {
      type: String,
      enum: ["futurepedia", "theresanaiforthat", "github", "producthunt"],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      trim: true
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
      trim: true,
      lowercase: true
    },
    category: {
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
    directoryUrl: {
      type: String,
      default: null
    },
    popularityScore: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const ExternalSearchCacheSchema = new Schema(
  {
    cacheKey: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    results: {
      type: [ExternalSearchResultSchema],
      default: []
    },
    fetchedAt: {
      type: Date,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

ExternalSearchCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
ExternalSearchCacheSchema.index({ query: 1, fetchedAt: -1 });

export type ExternalSearchCacheDocument = InferSchemaType<typeof ExternalSearchCacheSchema>;

export const ExternalSearchCacheModel =
  models.ExternalSearchCache || model("ExternalSearchCache", ExternalSearchCacheSchema);
