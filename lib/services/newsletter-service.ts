import { connectToDatabase } from "@/lib/mongodb";
import { NewsletterSubscriptionModel } from "@/models/newsletter-model";

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
    await connectToDatabase();

    const email = normalizeEmail(input.email);
    const source = input.source;
    const pagePath = normalizePath(input.pagePath);
    const toolSlug = normalizeToolSlug(input.toolSlug);
    const now = new Date();
    const addToSet: Record<string, string> = {
      sources: source
    };

    if (pagePath) {
      addToSet.pagePaths = pagePath;
    }

    if (toolSlug) {
      addToSet.toolSlugs = toolSlug;
    }

    const subscription = await NewsletterSubscriptionModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          status: "active",
          lastSubscribedAt: now
        },
        $inc: {
          signupCount: 1
        },
        $addToSet: addToSet
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    )
      .select({ _id: 1 })
      .lean<{ _id: { toString(): string } } | null>();

    return {
      id: subscription?._id?.toString() ?? email,
      email,
      source
    };
  }
}
