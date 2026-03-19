import { slugify } from "@/utils/slugify";
import { connectToDatabase } from "@/lib/mongodb";
import { AppError } from "@/lib/errors";
import { serializeCategory } from "@/lib/serializers/category";
import { CategoryModel } from "@/models/Category";
import { SubmissionModel } from "@/models/Submission";
import { ToolModel } from "@/models/Tool";

interface CategoryWriteInput {
  name?: string;
  slug?: string;
  description?: string;
}

export class CategoryService {
  static async listCategories(options?: { q?: string; page?: number; limit?: number }) {
    await connectToDatabase();

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (options?.q) {
      const pattern = new RegExp(options.q, "i");
      filter.$or = [{ name: pattern }, { description: pattern }];
    }

    const [categories, total, toolCounts] = await Promise.all([
      CategoryModel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      CategoryModel.countDocuments(filter),
      ToolModel.aggregate<{ _id: string; count: number }>([
        { $match: { status: "approved" } },
        { $group: { _id: "$categorySlug", count: { $sum: 1 } } }
      ])
    ]);

    const countsBySlug = new Map(toolCounts.map((item) => [item._id, item.count]));

    return {
      data: categories.map((category) => serializeCategory(category, countsBySlug.get(category.slug) ?? 0)),
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    };
  }

  static async listPublicCategories() {
    const result = await this.listCategories({ page: 1, limit: 100 });
    return result.data;
  }

  static async getCategoryBySlug(slug: string) {
    await connectToDatabase();

    const category = await CategoryModel.findOne({ slug }).lean();

    if (!category || Array.isArray(category)) {
      throw new AppError(404, "Category not found.", "CATEGORY_NOT_FOUND");
    }

    const toolCount = await ToolModel.countDocuments({
      categorySlug: slug,
      status: "approved"
    });

    return serializeCategory(category, toolCount);
  }

  static async createCategory(input: Required<CategoryWriteInput>) {
    await connectToDatabase();

    const slug = input.slug ? slugify(input.slug) : slugify(input.name);
    const existing = await CategoryModel.findOne({
      $or: [{ slug }, { name: input.name }]
    }).lean();

    if (existing) {
      throw new AppError(409, "Category already exists.", "CATEGORY_EXISTS");
    }

    const category = await CategoryModel.create({
      name: input.name,
      slug,
      description: input.description
    });

    return serializeCategory(category.toObject(), 0);
  }

  static async updateCategoryBySlug(slug: string, input: CategoryWriteInput) {
    await connectToDatabase();

    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      throw new AppError(404, "Category not found.", "CATEGORY_NOT_FOUND");
    }

    const nextName = input.name ?? category.name;
    const nextSlug = input.slug ? slugify(input.slug) : category.slug;
    const nextDescription = input.description ?? category.description;
    const changedCategoryKey = nextSlug !== category.slug || nextName !== category.name;

    if (changedCategoryKey) {
      const duplicate = await CategoryModel.findOne({
        _id: { $ne: category._id },
        $or: [{ slug: nextSlug }, { name: nextName }]
      }).lean();

      if (duplicate) {
        throw new AppError(409, "Another category already uses this name or slug.", "CATEGORY_EXISTS");
      }
    }

    category.name = nextName;
    category.slug = nextSlug;
    category.description = nextDescription;
    await category.save();

    if (changedCategoryKey) {
      await Promise.all([
        ToolModel.updateMany(
          { category: category._id },
          { $set: { categoryName: nextName, categorySlug: nextSlug } }
        ),
        SubmissionModel.updateMany(
          { category: category._id },
          { $set: { categoryName: nextName, categorySlug: nextSlug } }
        )
      ]);
    }

    return this.getCategoryBySlug(nextSlug);
  }

  static async deleteCategoryBySlug(slug: string) {
    await connectToDatabase();

    const category = await CategoryModel.findOne({ slug });

    if (!category) {
      throw new AppError(404, "Category not found.", "CATEGORY_NOT_FOUND");
    }

    const [toolCount, submissionCount] = await Promise.all([
      ToolModel.countDocuments({ category: category._id }),
      SubmissionModel.countDocuments({ category: category._id, status: { $ne: "rejected" } })
    ]);

    if (toolCount > 0 || submissionCount > 0) {
      throw new AppError(
        409,
        "Cannot delete a category that still has tools or active submissions.",
        "CATEGORY_IN_USE"
      );
    }

    await category.deleteOne();
  }
}
