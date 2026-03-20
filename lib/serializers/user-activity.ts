import type { UserActivity } from "@/types";

type SerializableRecord = Record<string, unknown> & {
  _id: unknown;
};

function toObjectIdString(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object" && "toString" in value) {
    return value.toString();
  }

  return "";
}

function toIsoString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

export function serializeUserActivity(record: SerializableRecord): UserActivity {
  return {
    id: toObjectIdString(record._id),
    userId: toObjectIdString(record.userId),
    kind: record.kind as UserActivity["kind"],
    toolId: record.toolId ? toObjectIdString(record.toolId) : null,
    submissionId: record.submissionId ? toObjectIdString(record.submissionId) : null,
    toolName: record.toolName ? String(record.toolName) : null,
    toolSlug: record.toolSlug ? String(record.toolSlug) : null,
    submissionName: record.submissionName ? String(record.submissionName) : null,
    submissionSlug: record.submissionSlug ? String(record.submissionSlug) : null,
    createdAt: toIsoString(record.createdAt)
  };
}
