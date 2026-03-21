import mongoose from "mongoose";
import { slugify } from "@/utils/slugify";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { toObjectId } from "@/lib/object-id";
import { serializeSubmission } from "@/lib/serializers/submission";
import { absoluteUrl } from "@/lib/seo";
import { sanitizeOptionalText, sanitizeOptionalUrl, sanitizeTagList, sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { extractWebsiteDomain } from "@/lib/url";
import { SubmissionModel } from "@/models/Submission";
import { ToolModel } from "@/models/Tool";
import { UserModel } from "@/models/User";
import { CategoryService } from "@/lib/services/category-service";
import { EmailService } from "@/lib/services/email-service";
import { ToolService } from "@/lib/services/tool-service";
import { UserActivityService } from "@/lib/services/user-activity-service";

type ObjectId = mongoose.Types.ObjectId;

interface SubmissionWriteInput {
  name: string;
  tagline: string;
  website: string;
  affiliateUrl?: string | null;
  launchYear?: number | null;
  description: string;
  categorySlug: string;
  tags: string[];
  pricing: "Free" | "Freemium" | "Paid";
  logo?: string | null;
  screenshots?: string[];
  contactEmail?: string | null;
  status?: "pending" | "approved" | "rejected";
  moderationNote?: string | null;
  submittedBy?: string | null;
}

function sanitizeLaunchYear(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const normalized = Math.floor(Number(value));

  if (!Number.isFinite(normalized) || normalized < 1990 || normalized > currentYear) {
    return null;
  }

  return normalized;
}

async function resolveRecipientEmail(input: {
  contactEmail?: string | null;
  submittedBy?: ObjectId | string | null;
}) {
  if (input.contactEmail) {
    return input.contactEmail;
  }

  if (!input.submittedBy) {
    return null;
  }

  const user = await UserModel.findById(input.submittedBy)
    .select({ email: 1 })
    .lean<{ email?: string | null } | null>();

  return user?.email ?? null;
}

async function resolveSubmissionSlug(baseValue: string, excludeId?: ObjectId) {
  const baseSlug = slugify(baseValue);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await SubmissionModel.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    })
      .select({ _id: 1 })
      .lean();

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function findDuplicateSubmissionOrTool(options: {
  slug?: string;
  websiteDomain?: string | null;
  excludeSubmissionId?: ObjectId;
  excludeToolId?: ObjectId | null;
}) {
  const predicates: Record<string, unknown>[] = [];

  if (options.slug) {
    predicates.push({ slug: options.slug });
  }

  if (options.websiteDomain) {
    predicates.push({ websiteDomain: options.websiteDomain });
  }

  if (!predicates.length) {
    return null;
  }

  const [existingSubmission, existingTool] = await Promise.all([
    SubmissionModel.findOne({
      ...(options.excludeSubmissionId ? { _id: { $ne: options.excludeSubmissionId } } : {}),
      status: { $ne: "rejected" },
      $or: predicates
    })
      .select({ _id: 1, name: 1, slug: 1, websiteDomain: 1, status: 1 })
      .lean<{ _id: ObjectId; name: string; slug: string; websiteDomain?: string | null; status: string } | null>(),
    ToolModel.findOne({
      ...(options.excludeToolId ? { _id: { $ne: options.excludeToolId } } : {}),
      status: { $ne: "rejected" },
      $or: predicates
    })
      .select({ _id: 1, name: 1, slug: 1, websiteDomain: 1, status: 1 })
      .lean<{ _id: ObjectId; name: string; slug: string; websiteDomain?: string | null; status: string } | null>()
  ]);

  if (existingTool) {
    return {
      kind: "tool" as const,
      record: existingTool
    };
  }

  if (existingSubmission) {
    return {
      kind: "submission" as const,
      record: existingSubmission
    };
  }

  return null;
}

function assertNoDuplicateSubmission(result: Awaited<ReturnType<typeof findDuplicateSubmissionOrTool>>) {
  if (!result) {
    return;
  }

  throw new AppError(
    409,
    `A ${result.kind} already exists for ${result.record.name}.`,
    "SUBMISSION_DUPLICATE",
    {
      kind: result.kind,
      slug: result.record.slug,
      websiteDomain: result.record.websiteDomain ?? null,
      status: result.record.status
    }
  );
}

export class SubmissionService {
  static async listSubmissions(options: {
    page: number;
    limit: number;
    q?: string;
    category?: string;
    status?: "pending" | "approved" | "rejected";
    submittedBy?: string;
  }) {
    await connectToDatabase();

    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = {};

    if (options.category) {
      filter.categorySlug = options.category;
    }

    if (options.status) {
      filter.status = options.status;
    }

    if (options.submittedBy) {
      filter.submittedBy = toObjectId(options.submittedBy, "submittedBy");
    }

    if (options.q) {
      const pattern = new RegExp(options.q, "i");
      filter.$or = [{ name: pattern }, { tagline: pattern }, { description: pattern }];
    }

    const [records, total] = await Promise.all([
      SubmissionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit).lean(),
      SubmissionModel.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => serializeSubmission(record)),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async getSubmissionById(id: string) {
    await connectToDatabase();

    const record = await SubmissionModel.findById(toObjectId(id, "submissionId")).lean();

    if (!record || Array.isArray(record)) {
      throw new AppError(404, "Submission not found.", "SUBMISSION_NOT_FOUND");
    }

    return serializeSubmission(record);
  }

  static async listSubmissionsForUser(
    userId: string,
    options: {
      page: number;
      limit: number;
      status?: "pending" | "approved" | "rejected";
    }
  ) {
    return this.listSubmissions({
      page: options.page,
      limit: options.limit,
      status: options.status,
      submittedBy: userId
    });
  }

  static async createSubmission(
    input: SubmissionWriteInput,
    options?: {
      disableNotifications?: boolean;
    }
  ) {
    await connectToDatabase();

    const category = await CategoryService.getCategoryBySlug(input.categorySlug);
    const sanitizedName = sanitizeText(input.name);
    const sanitizedWebsite = sanitizeUrl(input.website);
    const websiteDomain = extractWebsiteDomain(sanitizedWebsite);
    const requestedSlug = slugify(sanitizedName);

    assertNoDuplicateSubmission(
      await findDuplicateSubmissionOrTool({
        slug: requestedSlug,
        websiteDomain
      })
    );

    const slug = await resolveSubmissionSlug(sanitizedName);

    const submission = await SubmissionModel.create({
      slug,
      name: sanitizedName,
      tagline: sanitizeText(input.tagline),
      website: sanitizedWebsite,
      websiteDomain,
      affiliateUrl: sanitizeOptionalUrl(input.affiliateUrl ?? null),
      launchYear: sanitizeLaunchYear(input.launchYear),
      description: sanitizeText(input.description),
      category: toObjectId(category.id, "category"),
      categoryName: category.name,
      categorySlug: category.slug,
      tags: sanitizeTagList(input.tags),
      pricing: input.pricing,
      logo: sanitizeOptionalUrl(input.logo ?? null),
      screenshots: (input.screenshots ?? []).map((shot) => sanitizeUrl(shot)),
      contactEmail: sanitizeOptionalText(input.contactEmail ?? null)?.toLowerCase() ?? null,
      status: "pending",
      submittedBy: input.submittedBy ? toObjectId(input.submittedBy, "submittedBy") : null
    });

    if (input.submittedBy) {
      await UserActivityService.recordToolSubmitted(input.submittedBy, submission._id.toString());
    }

    if (!options?.disableNotifications) {
      await Promise.all([
        EmailService.sendSubmissionReceivedEmail({
          toolName: submission.name,
          categoryName: submission.categoryName,
          submissionUrl: absoluteUrl("/admin/submissions")
        }),
        (async () => {
          const recipientEmail = await resolveRecipientEmail({
            contactEmail: submission.contactEmail,
            submittedBy: submission.submittedBy
          });

          if (!recipientEmail) {
            return { delivered: false };
          }

          return EmailService.sendSubmissionConfirmationEmail({
            to: recipientEmail,
            toolName: submission.name,
            queueUrl: absoluteUrl("/submit")
          });
        })()
      ]);
    }

    return serializeSubmission(submission.toObject());
  }

  static async updateSubmission(
    id: string,
    input: Partial<SubmissionWriteInput>,
    moderatedBy?: string | null,
    options?: {
      disableNotifications?: boolean;
    }
  ) {
    await connectToDatabase();

    const submission = await SubmissionModel.findById(toObjectId(id, "submissionId"));

    if (!submission) {
      throw new AppError(404, "Submission not found.", "SUBMISSION_NOT_FOUND");
    }

    const nextName = input.name !== undefined ? sanitizeText(input.name) : submission.name;
    const nextWebsite = input.website !== undefined ? sanitizeUrl(input.website) : submission.website;
    const nextSlug =
      input.name !== undefined ? slugify(nextName) : submission.slug;
    const nextWebsiteDomain = extractWebsiteDomain(nextWebsite);

    assertNoDuplicateSubmission(
      await findDuplicateSubmissionOrTool({
        slug: nextSlug,
        websiteDomain: nextWebsiteDomain,
        excludeSubmissionId: submission._id,
        excludeToolId: submission.approvedTool
      })
    );

    if (input.categorySlug) {
      const category = await CategoryService.getCategoryBySlug(input.categorySlug);
      submission.category = toObjectId(category.id, "category");
      submission.categoryName = category.name;
      submission.categorySlug = category.slug;
    }

    if (input.name !== undefined) {
      submission.name = nextName;
      submission.slug = await resolveSubmissionSlug(nextName, submission._id);
    }

    if (input.tagline !== undefined) submission.tagline = sanitizeText(input.tagline);
    if (input.website !== undefined) {
      submission.website = nextWebsite;
      submission.websiteDomain = nextWebsiteDomain;
    }
    if (input.affiliateUrl !== undefined) submission.affiliateUrl = sanitizeOptionalUrl(input.affiliateUrl ?? null);
    if (input.launchYear !== undefined) submission.launchYear = sanitizeLaunchYear(input.launchYear);
    if (input.description !== undefined) submission.description = sanitizeText(input.description);
    if (input.tags !== undefined) submission.tags = sanitizeTagList(input.tags);
    if (input.pricing !== undefined) submission.pricing = input.pricing;
    if (input.logo !== undefined) submission.logo = sanitizeOptionalUrl(input.logo ?? null);
    if (input.screenshots !== undefined) submission.screenshots = input.screenshots.map((shot) => sanitizeUrl(shot));
    if (input.contactEmail !== undefined) {
      submission.contactEmail = sanitizeOptionalText(input.contactEmail ?? null)?.toLowerCase() ?? null;
    }
    if (input.moderationNote !== undefined) submission.moderationNote = sanitizeOptionalText(input.moderationNote ?? null);

    const previousStatus = submission.status as "pending" | "approved" | "rejected";

    if (input.status !== undefined) {
      submission.status = input.status;
    }

    if (moderatedBy) {
      submission.moderatedBy = toObjectId(moderatedBy, "moderatedBy");
      submission.reviewedAt = new Date();
    }

    await submission.save();

    if (input.status === "approved") {
      const toolPayload = {
        slug: submission.slug,
        name: submission.name,
        tagline: submission.tagline,
        website: submission.website,
        affiliateUrl: submission.affiliateUrl,
        launchYear: submission.launchYear,
        description: submission.description,
        categorySlug: submission.categorySlug,
        tags: submission.tags,
        pricing: submission.pricing,
        logo: submission.logo,
        screenshots: submission.screenshots,
        featured: false,
        trendingScore: 0,
        rating: 0,
        reviewCount: 0,
        status: "approved" as const
      };

      if (submission.approvedTool) {
        const linkedTool = (await ToolModel.findById(submission.approvedTool).lean()) as
          | { slug: string }
          | null;

        if (linkedTool) {
          await ToolService.updateToolBySlug(linkedTool.slug, toolPayload);
        }
      } else {
        const tool = await ToolService.createTool({
          ...toolPayload,
          createdBy: submission.submittedBy?.toString() ?? null,
          sourceSubmission: submission._id.toString()
        });

        submission.approvedTool = toObjectId(tool.id, "approvedToolId");
        await submission.save();
      }

      if (previousStatus !== "approved" && !options?.disableNotifications) {
        const recipientEmail = await resolveRecipientEmail({
          contactEmail: submission.contactEmail,
          submittedBy: submission.submittedBy
        });

        if (recipientEmail) {
          await EmailService.sendSubmissionApprovedEmail({
            to: recipientEmail,
            toolName: submission.name,
            toolUrl: absoluteUrl(`/tools/${submission.slug}`)
          });
        }
      }
    } else if (
      previousStatus === "approved" &&
      input.status !== undefined &&
      submission.approvedTool
    ) {
      await ToolModel.findByIdAndUpdate(submission.approvedTool, { $set: { status: input.status } });
    }

    return serializeSubmission(submission.toObject());
  }

  static async deleteSubmission(id: string) {
    await connectToDatabase();

    const submission = await SubmissionModel.findById(toObjectId(id, "submissionId"));

    if (!submission) {
      throw new AppError(404, "Submission not found.", "SUBMISSION_NOT_FOUND");
    }

    await submission.deleteOne();
  }
}
