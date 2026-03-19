"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { Category } from "@/types";
import type { ActionState } from "@/lib/actions/action-types";
import { toActionState } from "@/lib/actions/action-types";
import { requireAdminSession } from "@/lib/server-guards";
import { CategoryService } from "@/lib/services/category-service";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validators/category";

export async function createCategoryAction(input: unknown) {
  await requireAdminSession();
  const payload = categoryCreateSchema.parse(input);
  const category = await CategoryService.createCategory({
    name: payload.name,
    slug: payload.slug ?? payload.name,
    description: payload.description
  });

  revalidateTag("categories");
  revalidateTag("tools");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");

  return category;
}

export async function updateCategoryAction(slug: string, input: unknown) {
  await requireAdminSession();
  const payload = categoryUpdateSchema.parse(input);
  const category = await CategoryService.updateCategoryBySlug(slug, payload);

  revalidateTag("categories");
  revalidateTag("tools");
  revalidatePath("/categories");
  revalidatePath(`/categories/${category.slug}`);
  revalidatePath("/admin/categories");

  return category;
}

export async function deleteCategoryAction(slug: string) {
  await requireAdminSession();
  await CategoryService.deleteCategoryBySlug(slug);

  revalidateTag("categories");
  revalidateTag("tools");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
}

function getCategoryFormInput(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim()
  };
}

export async function categoryFormAction(
  slug: string | null,
  _: ActionState<Category>,
  formData: FormData
): Promise<ActionState<Category>> {
  try {
    const input = getCategoryFormInput(formData);
    const category = slug
      ? await updateCategoryAction(slug, input)
      : await createCategoryAction(input);

    return {
      status: "success",
      message: slug ? "Category updated." : "Category created.",
      data: category
    };
  } catch (error) {
    return toActionState<Category>(error, "Unable to save the category.");
  }
}

export async function deleteCategoryFormAction(slug: string): Promise<ActionState> {
  try {
    await deleteCategoryAction(slug);

    return {
      status: "success",
      message: "Category deleted."
    };
  } catch (error) {
    return toActionState(error, "Unable to delete the category.");
  }
}
