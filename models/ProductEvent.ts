import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const ProductEventSchema = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        "tools_search",
        "finder_search",
        "tool_detail_view",
        "compare_view",
        "cta_click"
      ]
    },
    query: {
      type: String,
      default: null
    },
    path: {
      type: String,
      required: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

ProductEventSchema.index({ eventType: 1, createdAt: -1 });
ProductEventSchema.index({ path: 1, createdAt: -1 });

export type ProductEventDocument = InferSchemaType<typeof ProductEventSchema>;

export const ProductEventModel = models.ProductEvent || model("ProductEvent", ProductEventSchema);

