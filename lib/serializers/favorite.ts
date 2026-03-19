import type { Favorite } from "@/types";

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

  return "";
}

export function serializeFavorite(record: SerializableRecord): Favorite {
  return {
    id: toObjectIdString(record._id),
    userId: toObjectIdString(record.userId),
    toolId: toObjectIdString(record.toolId),
    createdAt: toIsoString(record.createdAt)
  };
}
