import { NewsletterStore } from "@/lib/newsletter-store";

export interface NewsletterSubscribeInput {
  email: string;
  source: "homepage" | "tool-page" | "exit-intent";
  pagePath?: string | null;
  toolSlug?: string | null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePath(pagePath?: string | null) {
  if (!pagePath) {
    return null;
  }

  const trimmed = pagePath.trim();
  return trimmed.startsWith("/") ? trimmed : null;
}

function normalizeToolSlug(toolSlug?: string | null) {
  const trimmed = toolSlug?.trim();
  return trimmed ? trimmed : null;
}

export class NewsletterService {
  static async subscribe(input: NewsletterSubscribeInput) {
    const email = normalizeEmail(input.email);
    const source = input.source;
    const pagePath = normalizePath(input.pagePath);
    const toolSlug = normalizeToolSlug(input.toolSlug);
    const subscription = await NewsletterStore.subscribe({
      email,
      source,
      pagePath,
      toolSlug
    });

    return {
      id: subscription.id,
      email,
      source
    };
  }
}
