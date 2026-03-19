export function normalizeWebsiteUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.hash = "";
    return url.toString();
  } catch {
    return trimmed;
  }
}

export function extractWebsiteDomain(input: string) {
  const normalized = normalizeWebsiteUrl(input);

  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}
