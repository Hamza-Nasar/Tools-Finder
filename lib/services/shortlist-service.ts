import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { toObjectId } from "@/lib/object-id";
import { sanitizeText } from "@/lib/sanitize";
import { ToolService } from "@/lib/services/tool-service";
import { UserShortlistModel } from "@/models/UserShortlist";
import type { Tool } from "@/types";

interface SavedShortlist {
  id: string;
  name: string;
  query: string;
  inferredCategories: string[];
  inferredTags: string[];
  tools: Tool[];
  shareSlug: string;
  createdAt: string;
  updatedAt: string;
}

function toIsoString(value: Date | string | undefined) {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export class ShortlistService {
  static async createForUser(input: {
    userId: string;
    query: string;
    toolIds: string[];
    inferredCategories?: string[];
    inferredTags?: string[];
  }): Promise<SavedShortlist> {
    await connectToDatabase();

    const userObjectId = toObjectId(input.userId, "userId");
    const normalizedQuery = sanitizeText(input.query).slice(0, 320);

    if (input.toolIds.length < 1) {
      throw new AppError(400, "Select at least one tool before saving a shortlist.", "INVALID_SHORTLIST");
    }

    const tools = await ToolService.listToolsByIds(input.toolIds.slice(0, 8));

    if (!tools.length) {
      throw new AppError(404, "No valid tools found for this shortlist.", "TOOLS_NOT_FOUND");
    }

    const shareSlug = randomUUID().replace(/-/g, "").slice(0, 12);

    const doc = await UserShortlistModel.create({
      userId: userObjectId,
      name: normalizedQuery.length > 52 ? `${normalizedQuery.slice(0, 49)}...` : normalizedQuery,
      query: normalizedQuery,
      inferredCategories: (input.inferredCategories ?? []).slice(0, 6),
      inferredTags: (input.inferredTags ?? []).slice(0, 10),
      toolIds: tools.map((tool) => toObjectId(tool.id, "toolId")),
      shareSlug
    });

    return {
      id: doc._id.toString(),
      name: doc.name,
      query: doc.query,
      inferredCategories: doc.inferredCategories,
      inferredTags: doc.inferredTags,
      tools,
      shareSlug: doc.shareSlug,
      createdAt: toIsoString(doc.createdAt),
      updatedAt: toIsoString(doc.updatedAt)
    };
  }

  static async listForUser(userId: string, limit = 10): Promise<SavedShortlist[]> {
    await connectToDatabase();
    const userObjectId = toObjectId(userId, "userId");
    const rows = await UserShortlistModel.find({ userId: userObjectId }).sort({ updatedAt: -1 }).limit(limit);

    const toolIdSet = new Set<string>();
    rows.forEach((row) => row.toolIds.forEach((id: { toString(): string }) => toolIdSet.add(id.toString())));

    const tools = await ToolService.listToolsByIds(Array.from(toolIdSet));
    const toolsById = new Map(tools.map((tool) => [tool.id, tool]));

    return rows.map((row) => ({
      id: row._id.toString(),
      name: row.name,
      query: row.query,
      inferredCategories: row.inferredCategories,
      inferredTags: row.inferredTags,
      tools: row.toolIds
        .map((id: { toString(): string }) => toolsById.get(id.toString()))
        .filter((filteredTool: Tool | undefined): filteredTool is Tool => Boolean(filteredTool)),
      shareSlug: row.shareSlug,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt)
    }));
  }

  static async getByShareSlug(shareSlug: string): Promise<SavedShortlist | null> {
    await connectToDatabase();
    const row = await UserShortlistModel.findOne({ shareSlug: shareSlug.trim() });
    if (!row) return null;

    const tools = await ToolService.listToolsByIds(row.toolIds.map((id: { toString(): string }) => id.toString()));

    return {
      id: row._id.toString(),
      name: row.name,
      query: row.query,
      inferredCategories: row.inferredCategories,
      inferredTags: row.inferredTags,
      tools,
      shareSlug: row.shareSlug,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt)
    };
  }
}
