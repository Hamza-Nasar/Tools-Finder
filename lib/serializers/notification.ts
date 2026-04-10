import type { UserNotification } from "@/types";

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

export function serializeNotification(record: SerializableRecord): UserNotification {
  return {
    id: toObjectIdString(record._id),
    userId: toObjectIdString(record.userId),
    kind: record.kind as UserNotification["kind"],
    title: String(record.title ?? ""),
    message: String(record.message ?? ""),
    href: record.href ? String(record.href) : null,
    readAt: record.readAt ? toIsoString(record.readAt) : null,
    createdAt: toIsoString(record.createdAt)
  };
}
