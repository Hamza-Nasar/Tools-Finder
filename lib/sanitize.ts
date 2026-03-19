export function sanitizeText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeOptionalText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const sanitized = sanitizeText(value);
  return sanitized || null;
}

export function sanitizeUrl(value: string) {
  return value.trim();
}

export function sanitizeOptionalUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const sanitized = value.trim();
  return sanitized || null;
}

export function sanitizeTagList(values: string[]) {
  return values
    .map((value) => sanitizeText(value).toLowerCase())
    .filter(Boolean);
}
