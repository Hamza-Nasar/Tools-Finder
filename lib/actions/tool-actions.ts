"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { Tool } from "@/types";
import type { ActionState } from "@/lib/actions/action-types";
import { toActionState } from "@/lib/actions/action-types";
import { requireAdminSession } from "@/lib/server-guards";
import { ToolService } from "@/lib/services/tool-service";
import { UserService } from "@/lib/services/user-service";
import { createToolSchema, updateToolSchema } from "@/lib/validators/tool";

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getToolFormInput(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    affiliateUrl: String(formData.get("affiliateUrl") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    tags: parseList(formData.get("tags")),
    pricing: String(formData.get("pricing") ?? "").trim(),
    logo: String(formData.get("logo") ?? "").trim() || null,
    screenshots: parseList(formData.get("screenshots")),
    featured: formData.get("featured") === "on",
    trendingScore: parseOptionalNumber(formData.get("trendingScore")) ?? 0,
    rating: parseOptionalNumber(formData.get("rating")) ?? 0,
    reviewCount: parseOptionalNumber(formData.get("reviewCount")) ?? 0,
    status: String(formData.get("status") ?? "").trim() || undefined
  };
}

export async function createToolAction(input: unknown) {
  const session = await requireAdminSession();
  const user = await UserService.syncSessionUser(session);
  const payload = createToolSchema.parse(input);
  const tool = await ToolService.createTool({
    slug: payload.slug,
    name: payload.name,
    tagline: payload.tagline,
    website: payload.website,
    affiliateUrl: payload.affiliateUrl ?? null,
    description: payload.description,
    categorySlug: payload.categorySlug,
    tags: payload.tags,
    pricing: payload.pricing,
    logo: payload.logo ?? null,
    screenshots: payload.screenshots,
    featured: payload.featured,
    trendingScore: payload.trendingScore,
    rating: payload.rating,
    reviewCount: payload.reviewCount,
    status: payload.status,
    createdBy: user.id
  });

  revalidateTag("tools");
  revalidateTag("categories");
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath(`/tools/${tool.slug}`);
  revalidatePath("/admin/tools");

  return tool;
}

export async function updateToolAction(slug: string, input: unknown) {
  await requireAdminSession();
  const payload = updateToolSchema.parse(input);
  const tool = await ToolService.updateToolBySlug(slug, payload);

  revalidateTag("tools");
  revalidateTag("categories");
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath(`/tools/${slug}`);
  revalidatePath(`/tools/${tool.slug}`);
  revalidatePath(`/categories/${tool.categorySlug}`);
  revalidatePath("/admin/tools");

  return tool;
}

export async function deleteToolAction(slug: string) {
  await requireAdminSession();
  await ToolService.deleteToolBySlug(slug);

  revalidateTag("tools");
  revalidateTag("categories");
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath("/admin/tools");
}

export async function toolFormAction(
  slug: string | null,
  _: ActionState<Tool>,
  formData: FormData
): Promise<ActionState<Tool>> {
  try {
    const input = getToolFormInput(formData);
    const tool = slug ? await updateToolAction(slug, input) : await createToolAction(input);

    return {
      status: "success",
      message: slug ? "Tool updated." : "Tool created.",
      data: tool
    };
  } catch (error) {
    return toActionState<Tool>(error, "Unable to save the tool.");
  }
}

export async function deleteToolFormAction(slug: string): Promise<ActionState> {
  try {
    await deleteToolAction(slug);

    return {
      status: "success",
      message: "Tool deleted."
    };
  } catch (error) {
    return toActionState(error, "Unable to delete the tool.");
  }
}

export async function toggleFeaturedFormAction(
  slug: string,
  featured: boolean
): Promise<ActionState<Tool>> {
  try {
    const tool = await updateToolAction(slug, { featured });

    return {
      status: "success",
      message: featured ? "Tool featured." : "Tool unfeatured.",
      data: tool
    };
  } catch (error) {
    return toActionState<Tool>(error, "Unable to update the featured state.");
  }
}
