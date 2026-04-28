import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { ToolModel } from "@/models/Tool";
import { ToolClaimModel } from "@/models/ToolClaim";
import { VendorLeadModel } from "@/models/VendorLead";
import { EmailService } from "@/lib/services/email-service";

function toObjectId(value: string, field: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(400, `Invalid ${field}.`, "INVALID_ID");
  }

  return new Types.ObjectId(value);
}

export class VendorService {
  static async createToolClaim(input: {
    userId: string;
    toolSlug: string;
    companyEmail: string;
    message?: string | null;
  }) {
    await connectToDatabase();
    const userObjectId = toObjectId(input.userId, "userId");
    const tool = await ToolModel.findOne({ slug: input.toolSlug, status: "approved" }, { _id: 1 }).lean<{ _id: Types.ObjectId } | null>();

    if (!tool) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    const claim = await ToolClaimModel.findOneAndUpdate(
      { toolId: tool._id, userId: userObjectId },
      {
        $set: {
          companyEmail: input.companyEmail.toLowerCase().trim(),
          message: input.message?.trim() || null,
          status: "pending",
          moderationNote: null,
          updatedAt: new Date()
        },
        $setOnInsert: {
          toolId: tool._id,
          userId: userObjectId
        }
      },
      { upsert: true, new: true }
    ).lean<{
      _id: Types.ObjectId;
      toolId: Types.ObjectId;
      userId: Types.ObjectId;
      companyEmail: string;
      message?: string | null;
      status: "pending" | "approved" | "rejected";
      createdAt?: Date;
      updatedAt?: Date;
    } | null>();

    if (!claim) {
      throw new AppError(500, "Claim could not be created.", "CLAIM_CREATE_FAILED");
    }

    await EmailService.sendVendorClaimReceivedEmail({
      to: claim.companyEmail,
      toolSlug: input.toolSlug
    });

    return {
      id: claim._id.toString(),
      toolId: claim.toolId.toString(),
      userId: claim.userId.toString(),
      companyEmail: claim.companyEmail,
      message: claim.message ?? null,
      status: claim.status,
      createdAt: claim.createdAt?.toISOString() ?? null,
      updatedAt: claim.updatedAt?.toISOString() ?? null
    };
  }

  static async createVendorLead(input: {
    toolSlug: string;
    sourcePath: string;
    contactName: string;
    contactEmail: string;
    useCase: string;
    budget?: "unknown" | "under_50" | "50_200" | "200_plus";
  }) {
    await connectToDatabase();
    const tool = await ToolModel.findOne({ slug: input.toolSlug, status: "approved" }, { _id: 1 }).lean<{ _id: Types.ObjectId } | null>();

    if (!tool) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    const lead = await VendorLeadModel.create({
      toolId: tool._id,
      sourcePath: input.sourcePath.trim(),
      contactName: input.contactName.trim(),
      contactEmail: input.contactEmail.toLowerCase().trim(),
      useCase: input.useCase.trim(),
      budget: input.budget ?? "unknown",
      status: "new"
    });

    await EmailService.sendVendorLeadNotification({
      toolSlug: input.toolSlug,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      useCase: input.useCase
    });

    return {
      id: lead._id.toString(),
      toolId: tool._id.toString(),
      status: lead.status,
      createdAt: lead.createdAt?.toISOString() ?? null
    };
  }

  static async listClaims(options: { page: number; limit: number; status?: "pending" | "approved" | "rejected" }) {
    await connectToDatabase();
    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = options.status ? { status: options.status } : {};
    const [records, total] = await Promise.all([
      ToolClaimModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .lean<
          Array<{
            _id: Types.ObjectId;
            toolId: Types.ObjectId;
            userId: Types.ObjectId;
            companyEmail: string;
            message?: string | null;
            status: "pending" | "approved" | "rejected";
            moderationNote?: string | null;
            createdAt?: Date;
            updatedAt?: Date;
          }>
        >(),
      ToolClaimModel.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => ({
        id: record._id.toString(),
        toolId: record.toolId.toString(),
        userId: record.userId.toString(),
        companyEmail: record.companyEmail,
        message: record.message ?? null,
        status: record.status,
        moderationNote: record.moderationNote ?? null,
        createdAt: record.createdAt?.toISOString() ?? null,
        updatedAt: record.updatedAt?.toISOString() ?? null
      })),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async updateClaimStatus(input: {
    claimId: string;
    status: "approved" | "rejected";
    moderationNote?: string | null;
  }) {
    await connectToDatabase();
    const claimObjectId = toObjectId(input.claimId, "claimId");
    const updated = await ToolClaimModel.findByIdAndUpdate(
      claimObjectId,
      {
        $set: {
          status: input.status,
          moderationNote: input.moderationNote?.trim() || null,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).lean<{
      _id: Types.ObjectId;
      status: "pending" | "approved" | "rejected";
      moderationNote?: string | null;
      updatedAt?: Date;
    } | null>();

    if (!updated) {
      throw new AppError(404, "Claim not found.", "CLAIM_NOT_FOUND");
    }

    return {
      id: updated._id.toString(),
      status: updated.status,
      moderationNote: updated.moderationNote ?? null,
      updatedAt: updated.updatedAt?.toISOString() ?? null
    };
  }

  static async listLeads(options: { page: number; limit: number; status?: "new" | "contacted" | "qualified" | "closed" }) {
    await connectToDatabase();
    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = options.status ? { status: options.status } : {};
    const [records, total] = await Promise.all([
      VendorLeadModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .lean<
          Array<{
            _id: Types.ObjectId;
            toolId: Types.ObjectId;
            sourcePath: string;
            contactName: string;
            contactEmail: string;
            useCase: string;
            budget: "unknown" | "under_50" | "50_200" | "200_plus";
            status: "new" | "contacted" | "qualified" | "closed";
            createdAt?: Date;
            updatedAt?: Date;
          }>
        >(),
      VendorLeadModel.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => ({
        id: record._id.toString(),
        toolId: record.toolId.toString(),
        sourcePath: record.sourcePath,
        contactName: record.contactName,
        contactEmail: record.contactEmail,
        useCase: record.useCase,
        budget: record.budget,
        status: record.status,
        createdAt: record.createdAt?.toISOString() ?? null,
        updatedAt: record.updatedAt?.toISOString() ?? null
      })),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async updateLeadStatus(input: {
    leadId: string;
    status: "new" | "contacted" | "qualified" | "closed";
  }) {
    await connectToDatabase();
    const leadObjectId = toObjectId(input.leadId, "leadId");
    const updated = await VendorLeadModel.findByIdAndUpdate(
      leadObjectId,
      {
        $set: {
          status: input.status,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).lean<{ _id: Types.ObjectId; status: "new" | "contacted" | "qualified" | "closed"; updatedAt?: Date } | null>();

    if (!updated) {
      throw new AppError(404, "Lead not found.", "LEAD_NOT_FOUND");
    }

    return {
      id: updated._id.toString(),
      status: updated.status,
      updatedAt: updated.updatedAt?.toISOString() ?? null
    };
  }
}
