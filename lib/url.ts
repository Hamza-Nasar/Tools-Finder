import { lookup } from "node:dns/promises";

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

function isPrivateIpv4Address(value: string) {
  const octets = value.split(".").map((part) => Number(part));

  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function expandIpv6Address(value: string) {
  const [head, tail = ""] = value.toLowerCase().split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];

  if (tailParts.some((part) => part.includes("."))) {
    return null;
  }

  const missingParts = 8 - (headParts.filter(Boolean).length + tailParts.filter(Boolean).length);

  if (missingParts < 0) {
    return null;
  }

  const parts = [
    ...headParts.filter(Boolean),
    ...Array.from({ length: value.includes("::") ? missingParts : 0 }, () => "0"),
    ...tailParts.filter(Boolean)
  ];

  return parts.length === 8 ? parts.map((part) => part.padStart(4, "0")) : null;
}

function isPrivateIpv6Address(value: string) {
  const normalized = value.split("%")[0];

  if (normalized === "::1") {
    return true;
  }

  const parts = expandIpv6Address(normalized);

  if (!parts) {
    return false;
  }

  const first = parseInt(parts[0], 16);
  const second = parseInt(parts[1], 16);

  return (
    first === 0xfc00 ||
    first === 0xfd00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first === 0x0000 && second === 0x0000)
  );
}

function isIpLiteral(hostname: string) {
  return /^[0-9.]+$/.test(hostname) || hostname.includes(":");
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  );
}

function isPrivateAddress(address: string) {
  return address.includes(":") ? isPrivateIpv6Address(address) : isPrivateIpv4Address(address);
}

export async function assertPublicHttpUrl(input: string) {
  const normalized = normalizeWebsiteUrl(input);
  const parsed = new URL(normalized);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }

  const hostname = parsed.hostname.toLowerCase();

  if (isBlockedHostname(hostname) || (isIpLiteral(hostname) && isPrivateAddress(hostname))) {
    throw new Error("Private or local network addresses are not allowed.");
  }

  const records = await lookup(hostname, { all: true, verbatim: true });

  if (!records.length || records.some((record) => isPrivateAddress(record.address))) {
    throw new Error("URL must resolve to a public network address.");
  }

  return normalized;
}
