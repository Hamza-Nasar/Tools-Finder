import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatRelativeDate(value: string) {
  const now = Date.now();
  const target = new Date(value).getTime();
  const diffInDays = Math.max(Math.round((now - target) / (1000 * 60 * 60 * 24)), 0);

  if (diffInDays === 0) {
    return "today";
  }

  if (diffInDays === 1) {
    return "1 day ago";
  }

  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }

  const diffInMonths = Math.max(Math.round(diffInDays / 30), 1);
  return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function formatCurrencyFromCents(value: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0
  }).format(value / 100);
}

export function getHostnameLabel(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}
