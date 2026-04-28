import mongoose from "mongoose";
import type { InferSchemaType } from "mongoose";

const { Schema, Types, model, models } = mongoose;

const VendorLeadSchema = new Schema(
  {
    toolId: {
      type: Types.ObjectId,
      ref: "Tool",
      required: true,
      index: true
    },
    sourcePath: {
      type: String,
      required: true,
      trim: true
    },
    contactName: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    useCase: {
      type: String,
      required: true,
      trim: true
    },
    budget: {
      type: String,
      enum: ["unknown", "under_50", "50_200", "200_plus"],
      default: "unknown"
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
      index: true
    }
  },
  {
    timestamps: true
  }
);

VendorLeadSchema.index({ toolId: 1, createdAt: -1 });

export type VendorLeadDocument = InferSchemaType<typeof VendorLeadSchema>;

export const VendorLeadModel = models.VendorLead || model("VendorLead", VendorLeadSchema);
