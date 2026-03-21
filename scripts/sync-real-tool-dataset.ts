import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { extractWebsiteDomain } from "@/lib/url";
import { datasetCategories, type RealToolDatasetEntry } from "@/lib/real-tool-dataset";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const datasetPath = path.join(workspaceRoot, "data", "real-ai-tools.json");
const IMPORTER_EMAIL = "dataset-sync@ai-tools-finder.local";
const IMPORTER_NAME = "AI Tools Dataset Sync";

async function loadEnvironmentFiles(root: string) {
  for (const relativePath of [".env.local", ".env"]) {
    const filePath = path.join(root, relativePath);

    try {
      const content = await readFile(filePath, "utf8");
      applyEnvContent(content);
    } catch {
      continue;
    }
  }
}

function applyEnvContent(content: string) {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function ensureCategories(CategoryService: typeof import("@/lib/services/category-service").CategoryService) {
  const existing = await CategoryService.listCategories({ page: 1, limit: 100 });
  const slugs = new Set(existing.data.map((category) => category.slug));

  for (const category of datasetCategories) {
    if (slugs.has(category.slug)) {
      continue;
    }

    await CategoryService.createCategory(category);
  }
}

async function ensureSyncUser(UserModel: typeof import("@/models/User").UserModel) {
  const user = await UserModel.findOneAndUpdate(
    { email: IMPORTER_EMAIL },
    {
      $setOnInsert: {
        email: IMPORTER_EMAIL,
        name: IMPORTER_NAME,
        role: "admin"
      }
    },
    { new: true, upsert: true }
  ).lean<{ _id: { toString(): string } } | null>();

  if (!user?._id) {
    throw new Error("Unable to create dataset sync user.");
  }

  return user._id.toString();
}

async function main() {
  await loadEnvironmentFiles(workspaceRoot);
  const [
    { connectToDatabase },
    { AppError },
    { CategoryService },
    { SubmissionService },
    { ToolService },
    { ToolModel },
    { UserModel },
    { default: mongoose }
  ] = await Promise.all([
    import("@/lib/mongodb"),
    import("@/lib/errors"),
    import("@/lib/services/category-service"),
    import("@/lib/services/submission-service"),
    import("@/lib/services/tool-service"),
    import("@/models/Tool"),
    import("@/models/User"),
    import("mongoose")
  ]);
  try {
    await connectToDatabase();
    await ensureCategories(CategoryService);

    const importerUserId = await ensureSyncUser(UserModel);
    const dataset = JSON.parse(await readFile(datasetPath, "utf8")) as RealToolDatasetEntry[];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const entry of dataset) {
      const websiteDomain = extractWebsiteDomain(entry.website);
      const existingTool = await ToolModel.findOne({
        status: { $ne: "rejected" },
        $or: [{ slug: entry.slug }, ...(websiteDomain ? [{ websiteDomain }] : [])]
      })
        .select({ slug: 1 })
        .lean<{ slug: string } | null>();

      if (existingTool?.slug) {
        await ToolService.updateToolBySlug(existingTool.slug, {
          slug: entry.slug,
          name: entry.name,
          tagline: entry.tagline,
          website: entry.website,
          description: entry.description,
          categorySlug: entry.category,
          tags: entry.tags,
          pricing: entry.pricing,
          logo: entry.logo ?? null,
          launchYear: entry.launchYear,
          status: "approved"
        });
        updated += 1;
        continue;
      }

      try {
        const submission = await SubmissionService.createSubmission(
          {
            name: entry.name,
            tagline: entry.tagline,
            website: entry.website,
            description: entry.description,
            categorySlug: entry.category,
            tags: entry.tags,
            pricing: entry.pricing,
            logo: entry.logo ?? null,
            screenshots: [],
            submittedBy: importerUserId,
            launchYear: entry.launchYear
          },
          { disableNotifications: true }
        );

        await SubmissionService.updateSubmission(
          submission.id,
          { status: "approved", launchYear: entry.launchYear },
          importerUserId,
          { disableNotifications: true }
        );
        inserted += 1;
      } catch (error) {
        if (error instanceof AppError && error.code === "SUBMISSION_DUPLICATE") {
          skipped += 1;
          continue;
        }

        throw error;
      }
    }

    console.log(`Dataset sync complete. Inserted: ${inserted}. Updated: ${updated}. Skipped: ${skipped}.`);
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
