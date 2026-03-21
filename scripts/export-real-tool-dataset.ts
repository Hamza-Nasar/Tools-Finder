import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { inferLaunchYear, type RealToolDatasetEntry } from "@/lib/real-tool-dataset";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(workspaceRoot, "data", "real-ai-tools.json");

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

async function main() {
  await loadEnvironmentFiles(workspaceRoot);
  const [{ connectToDatabase }, { ToolModel }, { default: mongoose }] = await Promise.all([
    import("@/lib/mongodb"),
    import("@/models/Tool"),
    import("mongoose")
  ]);
  try {
    await connectToDatabase();

    const records = await ToolModel.find(
      {
        status: "approved"
      },
      {
        name: 1,
        slug: 1,
        tagline: 1,
        description: 1,
        categorySlug: 1,
        tags: 1,
        pricing: 1,
        website: 1,
        logo: 1,
        launchYear: 1,
        createdAt: 1,
        favoritesCount: 1,
        viewsCount: 1,
        featured: 1
      }
    )
      .sort({ featured: -1, favoritesCount: -1, viewsCount: -1, createdAt: -1 })
      .limit(250)
      .lean();

    const dataset: RealToolDatasetEntry[] = records.map((record) => ({
      name: String(record.name),
      slug: String(record.slug),
      tagline: String(record.tagline),
      description: String(record.description),
      category: String(record.categorySlug),
      tags: Array.isArray(record.tags) ? record.tags.map((tag) => String(tag)) : [],
      pricing: record.pricing as RealToolDatasetEntry["pricing"],
      website: String(record.website),
      logo: record.logo ? String(record.logo) : null,
      launchYear: inferLaunchYear({
        slug: typeof record.slug === "string" ? record.slug : null,
        name: typeof record.name === "string" ? record.name : null,
        launchYear: typeof record.launchYear === "number" ? record.launchYear : null,
        createdAt: record.createdAt instanceof Date || typeof record.createdAt === "string" ? record.createdAt : null
      })
    }));

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
    console.log(`Exported ${dataset.length} tools to ${outputPath}`);
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
