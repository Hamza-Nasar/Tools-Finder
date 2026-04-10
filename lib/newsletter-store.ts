import { getMongoClient } from "@/lib/mongo-client";
import { env } from "@/lib/env";

export interface NewsletterSubscriptionRecord {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  sources: string[];
  pagePaths: string[];
  toolSlugs: string[];
  signupCount: number;
  lastSubscribedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface RawNewsletterSubscriptionRecord {
  _id: { toString(): string };
  email: string;
  status: "active" | "unsubscribed";
  sources?: string[];
  pagePaths?: string[];
  toolSlugs?: string[];
  signupCount?: number;
  lastSubscribedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

let newsletterIndexesPromise: Promise<void> | null = null;

function getNewsletterDatabaseName() {
  return env.NEWSLETTER_MONGODB_DB_NAME ?? `${env.MONGODB_DB_NAME ?? "aitoolsfinder"}_newsletter`;
}

async function getNewsletterCollection() {
  const client = await getMongoClient();
  return client.db(getNewsletterDatabaseName()).collection<RawNewsletterSubscriptionRecord>("newsletter_subscriptions");
}

async function ensureNewsletterIndexes() {
  if (!newsletterIndexesPromise) {
    newsletterIndexesPromise = (async () => {
      const collection = await getNewsletterCollection();
      await collection.createIndexes([
        { key: { email: 1 }, name: "newsletter_email_unique", unique: true },
        { key: { status: 1, lastSubscribedAt: -1 }, name: "newsletter_status_lastSubscribedAt" },
        { key: { sources: 1, lastSubscribedAt: -1 }, name: "newsletter_sources_lastSubscribedAt" }
      ]);
    })().catch((error) => {
      newsletterIndexesPromise = null;
      throw error;
    });
  }

  return newsletterIndexesPromise;
}

function serializeNewsletterSubscription(record: RawNewsletterSubscriptionRecord): NewsletterSubscriptionRecord {
  return {
    id: record._id.toString(),
    email: record.email,
    status: record.status,
    sources: record.sources ?? [],
    pagePaths: record.pagePaths ?? [],
    toolSlugs: record.toolSlugs ?? [],
    signupCount: record.signupCount ?? 1,
    lastSubscribedAt: (record.lastSubscribedAt ?? record.updatedAt ?? new Date()).toISOString(),
    createdAt: (record.createdAt ?? new Date()).toISOString(),
    updatedAt: (record.updatedAt ?? record.lastSubscribedAt ?? new Date()).toISOString()
  };
}

export class NewsletterStore {
  static async subscribe(input: {
    email: string;
    source: "homepage" | "tool-page" | "exit-intent";
    pagePath?: string | null;
    toolSlug?: string | null;
  }) {
    await ensureNewsletterIndexes();
    const collection = await getNewsletterCollection();
    const now = new Date();
    const addToSet: Record<string, string> = {
      sources: input.source
    };

    if (input.pagePath) {
      addToSet.pagePaths = input.pagePath;
    }

    if (input.toolSlug) {
      addToSet.toolSlugs = input.toolSlug;
    }

    const result = await collection.findOneAndUpdate(
      { email: input.email },
      {
        $set: {
          email: input.email,
          status: "active",
          lastSubscribedAt: now,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        },
        $inc: {
          signupCount: 1
        },
        $addToSet: addToSet
      },
      {
        upsert: true,
        returnDocument: "after"
      }
    );

    return serializeNewsletterSubscription(
      result ?? {
        _id: { toString: () => input.email },
        email: input.email,
        status: "active",
        sources: [input.source],
        pagePaths: input.pagePath ? [input.pagePath] : [],
        toolSlugs: input.toolSlug ? [input.toolSlug] : [],
        signupCount: 1,
        lastSubscribedAt: now,
        createdAt: now,
        updatedAt: now
      }
    );
  }

  static async listSubscriptions(options: {
    page: number;
    limit: number;
    source?: "homepage" | "tool-page" | "exit-intent";
    status?: "active" | "unsubscribed";
  }) {
    await ensureNewsletterIndexes();
    const collection = await getNewsletterCollection();
    const skip = (options.page - 1) * options.limit;
    const filter: Record<string, unknown> = {};

    if (options.status) {
      filter.status = options.status;
    }

    if (options.source) {
      filter.sources = options.source;
    }

    const [records, total] = await Promise.all([
      collection.find(filter).sort({ lastSubscribedAt: -1, updatedAt: -1 }).skip(skip).limit(options.limit).toArray(),
      collection.countDocuments(filter)
    ]);

    return {
      data: records.map((record) => serializeNewsletterSubscription(record)),
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.max(Math.ceil(total / options.limit), 1)
    };
  }

  static async getOverview() {
    await ensureNewsletterIndexes();
    const collection = await getNewsletterCollection();
    const [total, active, exitIntent, latest] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ status: "active" }),
      collection.countDocuments({ sources: "exit-intent" }),
      collection.find({}).sort({ lastSubscribedAt: -1, updatedAt: -1 }).limit(8).toArray()
    ]);

    return {
      total,
      active,
      exitIntent,
      latest: latest.map((record) => serializeNewsletterSubscription(record))
    };
  }

  static getDatabaseName() {
    return getNewsletterDatabaseName();
  }
}
