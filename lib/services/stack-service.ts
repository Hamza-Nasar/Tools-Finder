import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { toObjectId } from "@/lib/object-id";
import { sanitizeOptionalText, sanitizeText } from "@/lib/sanitize";
import { ToolService } from "@/lib/services/tool-service";
import { UserStackModel } from "@/models/UserStack";
import type { UserStack } from "@/types";

function toIsoString(value: Date | string | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export class StackService {
  private static async ensureStack(userId: string) {
    await connectToDatabase();

    const userObjectId = toObjectId(userId, "userId");
    let stack = await UserStackModel.findOne({ userId: userObjectId });

    if (!stack) {
      stack = await UserStackModel.create({
        userId: userObjectId,
        name: "My AI Stack",
        description: null,
        toolIds: []
      });
    }

    return stack;
  }

  static async getStackForUser(userId: string): Promise<UserStack> {
    const stack = await this.ensureStack(userId);
    const tools = await ToolService.listToolsByIds(
      stack.toolIds.map((toolId: { toString(): string }) => toolId.toString())
    );

    return {
      id: stack._id.toString(),
      userId,
      name: stack.name,
      description: stack.description ?? null,
      tools,
      createdAt: toIsoString(stack.createdAt),
      updatedAt: toIsoString(stack.updatedAt)
    };
  }

  static async addTool(userId: string, toolId: string) {
    await connectToDatabase();
    const stack = await this.ensureStack(userId);
    const tool = await ToolService.listToolsByIds([toolId]);

    if (!tool.length) {
      throw new AppError(404, "Tool not found.", "TOOL_NOT_FOUND");
    }

    const toolObjectId = toObjectId(toolId, "toolId");
    const alreadyExists = stack.toolIds.some(
      (id: { toString(): string }) => id.toString() === toolObjectId.toString()
    );

    if (!alreadyExists) {
      stack.toolIds.push(toolObjectId);
      await stack.save();
    }

    return this.getStackForUser(userId);
  }

  static async removeTool(userId: string, toolId: string) {
    const stack = await this.ensureStack(userId);
    stack.toolIds = stack.toolIds.filter((id: { toString(): string }) => id.toString() !== toolId);
    await stack.save();

    return this.getStackForUser(userId);
  }

  static async updateStackDetails(userId: string, input: { name: string; description?: string | null }) {
    const stack = await this.ensureStack(userId);
    stack.name = sanitizeText(input.name);
    stack.description = sanitizeOptionalText(input.description ?? null);
    await stack.save();

    return this.getStackForUser(userId);
  }
}
