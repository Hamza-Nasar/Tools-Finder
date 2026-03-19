import type { Category } from "@/types";

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
};

function toIsoString(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  return undefined;
}

export function serializeCategory(record: SerializableRecord, toolCount = 0): Category {
  return {
    id: toObjectIdString(record._id),
    name: String(record.name),
    slug: String(record.slug),
    description: String(record.description),
    toolCount,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt)
  };
}
