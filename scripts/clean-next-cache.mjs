import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDirs = [".next", ".next-dev"];

for (const cacheDir of cacheDirs) {
  const targetPath = path.join(rootDir, cacheDir);
  await rm(targetPath, { force: true, recursive: true });
  console.log(`[clean-next-cache] removed ${cacheDir}`);
}
