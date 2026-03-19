import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fileExtensions = [".ts", ".tsx", ".js", ".mjs", ".cjs"];

function resolvePath(candidatePath) {
  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return candidatePath;
  }

  for (const extension of fileExtensions) {
    if (fs.existsSync(`${candidatePath}${extension}`)) {
      return `${candidatePath}${extension}`;
    }
  }

  for (const extension of fileExtensions) {
    const indexPath = path.join(candidatePath, `index${extension}`);
    if (fs.existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const resolvedPath = resolvePath(path.join(workspaceRoot, specifier.slice(2)));

    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
