function envFlag(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw === "1" || raw.toLowerCase() === "true";
}

export const featureFlags = {
  comparePreview: envFlag("FF_COMPARE_PREVIEW", true),
  finderTelemetry: envFlag("FF_FINDER_TELEMETRY", true),
  toolsSearchTelemetry: envFlag("FF_TOOLS_SEARCH_TELEMETRY", true),
  adminAutoRefresh: envFlag("FF_ADMIN_AUTO_REFRESH", true)
} as const;

