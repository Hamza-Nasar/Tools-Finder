import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { MongoClient, ObjectId } from "mongodb";

type GenericDoc = Record<string, unknown> & { _id: ObjectId };
type IdMap = Map<string, ObjectId>;

interface CliOptions {
  dryRun: boolean;
  help: boolean;
  verifyOnly: boolean;
}

interface SyncStats {
  inserted: number;
  matchedExisting: number;
  skipped: number;
}

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DB_NAME = "aitoolsfinder";
const DEFAULT_SOURCE_URI = "mongodb://127.0.0.1:27017/aitoolsfinder";

function parseArgs(argv: string[]): CliOptions {
  return {
    dryRun: argv.includes("--dry-run"),
    help: argv.includes("--help") || argv.includes("-h"),
    verifyOnly: argv.includes("--verify-only")
  };
}

function printUsage() {
  console.log(`
Usage:
  npm run migrate-atlas
  npm run migrate-atlas -- --dry-run
  npm run migrate-atlas -- --verify-only

Environment:
  MONGODB_URI                  Atlas target connection string
  MONGODB_DB_NAME              Shared database name (default: ${DEFAULT_DB_NAME})
  MIGRATION_SOURCE_MONGODB_URI Local MongoDB source (default: ${DEFAULT_SOURCE_URI})
`.trim());
}

async function loadEnvironmentFiles(root: string) {
  for (const relativePath of [".env.local", ".env"]) {
    try {
      applyEnvContent(await readFile(path.join(root, relativePath), "utf8"));
    } catch {
      continue;
    }
  }
}

function applyEnvContent(content: string) {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function requiredEnv(name: string, fallback?: string) {
  const value = process.env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function emailValue(value: unknown) {
  return stringValue(value).toLowerCase();
}

function objectIdValue(value: unknown) {
  if (value instanceof ObjectId) {
    return value;
  }

  if (typeof value === "string" && ObjectId.isValid(value)) {
    return new ObjectId(value);
  }

  return null;
}

function objectIdKey(value: unknown) {
  return objectIdValue(value)?.toHexString() ?? "";
}

function dateKey(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return "";
}

function cloneDoc(document: GenericDoc): GenericDoc {
  return { ...document };
}

async function loadDocs(db: ReturnType<MongoClient["db"]>, collectionName: string) {
  return db.collection<GenericDoc>(collectionName).find({}).toArray();
}

function printStats(label: string, stats: SyncStats) {
  console.log(`${label}: inserted=${stats.inserted}, matchedExisting=${stats.matchedExisting}, skipped=${stats.skipped}`);
}

async function orphanCount(
  db: ReturnType<MongoClient["db"]>,
  collectionName: string,
  pipeline: Record<string, unknown>[]
) {
  const [result] = await db.collection(collectionName).aggregate<{ count: number }>([...pipeline, { $count: "count" }]).toArray();
  return result?.count ?? 0;
}

async function syncCategories(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, categoryIds: IdMap) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "categories"), loadDocs(targetDb, "categories")]);
  const targetBySlug = new Map(targetDocs.map((doc) => [stringValue(doc.slug), doc]));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const slug = stringValue(doc.slug);
    const existing = targetBySlug.get(slug);

    if (existing) {
      categoryIds.set(doc._id.toHexString(), existing._id);
      stats.matchedExisting += 1;
      continue;
    }

    categoryIds.set(doc._id.toHexString(), doc._id);
    inserts.push(cloneDoc(doc));
    targetBySlug.set(slug, doc);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("categories").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncUsers(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, userIds: IdMap) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "users"), loadDocs(targetDb, "users")]);
  const targetByEmail = new Map(targetDocs.map((doc) => [emailValue(doc.email), doc]));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const email = emailValue(doc.email);

    if (!email) {
      stats.skipped += 1;
      continue;
    }

    const existing = targetByEmail.get(email);

    if (existing) {
      userIds.set(doc._id.toHexString(), existing._id);
      stats.matchedExisting += 1;
      continue;
    }

    userIds.set(doc._id.toHexString(), doc._id);
    inserts.push(cloneDoc(doc));
    targetByEmail.set(email, doc);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("users").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncTools(
  sourceDb: ReturnType<MongoClient["db"]>,
  targetDb: ReturnType<MongoClient["db"]>,
  dryRun: boolean,
  categoryIds: IdMap,
  userIds: IdMap,
  toolIds: IdMap
) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "tools"), loadDocs(targetDb, "tools")]);
  const targetBySlug = new Map(targetDocs.map((doc) => [stringValue(doc.slug), doc]));
  const targetByDomain = new Map(targetDocs.filter((doc) => stringValue(doc.websiteDomain)).map((doc) => [stringValue(doc.websiteDomain), doc]));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const slug = stringValue(doc.slug);
    const domain = stringValue(doc.websiteDomain);
    const existing = targetBySlug.get(slug) ?? (domain ? targetByDomain.get(domain) : null);

    if (existing) {
      toolIds.set(doc._id.toHexString(), existing._id);
      stats.matchedExisting += 1;
      continue;
    }

    const categoryId = categoryIds.get(objectIdKey(doc.category));

    if (!categoryId) {
      stats.skipped += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc.category = categoryId;
    insertDoc.createdBy = doc.createdBy ? userIds.get(objectIdKey(doc.createdBy)) ?? null : null;
    insertDoc.sourceSubmission = null;
    toolIds.set(doc._id.toHexString(), insertDoc._id);
    inserts.push(insertDoc);
    targetBySlug.set(slug, insertDoc);

    if (domain) {
      targetByDomain.set(domain, insertDoc);
    }

    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("tools").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncSubmissions(
  sourceDb: ReturnType<MongoClient["db"]>,
  targetDb: ReturnType<MongoClient["db"]>,
  dryRun: boolean,
  categoryIds: IdMap,
  userIds: IdMap,
  toolIds: IdMap,
  submissionIds: IdMap
) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "submissions"), loadDocs(targetDb, "submissions")]);
  const targetById = new Map(targetDocs.map((doc) => [doc._id.toHexString(), doc]));
  const targetBySignature = new Map(
    targetDocs.map((doc) => [
      [stringValue(doc.slug), stringValue(doc.websiteDomain), objectIdKey(doc.submittedBy) || "anonymous", dateKey(doc.createdAt), stringValue(doc.status)].join("|"),
      doc
    ])
  );
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const submittedBy = doc.submittedBy ? userIds.get(objectIdKey(doc.submittedBy)) ?? null : null;
    const signature = [stringValue(doc.slug), stringValue(doc.websiteDomain), submittedBy?.toHexString() ?? "anonymous", dateKey(doc.createdAt), stringValue(doc.status)].join("|");
    const existing = targetById.get(doc._id.toHexString()) ?? targetBySignature.get(signature);

    if (existing) {
      submissionIds.set(doc._id.toHexString(), existing._id);
      stats.matchedExisting += 1;
      continue;
    }

    const categoryId = categoryIds.get(objectIdKey(doc.category));

    if (!categoryId) {
      stats.skipped += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc.category = categoryId;
    insertDoc.submittedBy = submittedBy;
    insertDoc.moderatedBy = doc.moderatedBy ? userIds.get(objectIdKey(doc.moderatedBy)) ?? null : null;
    insertDoc.approvedTool = doc.approvedTool ? toolIds.get(objectIdKey(doc.approvedTool)) ?? null : null;
    submissionIds.set(doc._id.toHexString(), insertDoc._id);
    inserts.push(insertDoc);
    targetById.set(insertDoc._id.toHexString(), insertDoc);
    targetBySignature.set(signature, insertDoc);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("submissions").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function patchToolSubmissionLinks(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, toolIds: IdMap, submissionIds: IdMap) {
  const sourceDocs = await loadDocs(sourceDb, "tools");
  const operations = sourceDocs
    .filter((doc) => doc.sourceSubmission)
    .map((doc) => {
      const toolId = toolIds.get(doc._id.toHexString());
      const submissionId = submissionIds.get(objectIdKey(doc.sourceSubmission));
      return toolId && submissionId ? { updateOne: { filter: { _id: toolId, $or: [{ sourceSubmission: null }, { sourceSubmission: { $exists: false } }] }, update: { $set: { sourceSubmission: submissionId } } } } : null;
    })
    .filter((operation): operation is NonNullable<typeof operation> => Boolean(operation));

  if (!dryRun && operations.length) {
    await targetDb.collection("tools").bulkWrite(operations, { ordered: false });
  }

  return operations.length;
}

async function syncFavorites(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, userIds: IdMap, toolIds: IdMap) {
  return syncPairCollection(sourceDb, targetDb, dryRun, "favorites", "userId", "toolId", userIds, toolIds);
}

async function syncReviews(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, userIds: IdMap, toolIds: IdMap) {
  return syncPairCollection(sourceDb, targetDb, dryRun, "reviews", "userId", "toolId", userIds, toolIds, (doc, leftId, rightId) =>
    `${leftId.toHexString()}|${rightId.toHexString()}|${stringValue(doc.rating)}|${stringValue(doc.comment)}`
  );
}

async function syncPairCollection(
  sourceDb: ReturnType<MongoClient["db"]>,
  targetDb: ReturnType<MongoClient["db"]>,
  dryRun: boolean,
  collectionName: string,
  leftField: string,
  rightField: string,
  leftIds: IdMap,
  rightIds: IdMap,
  signatureBuilder?: (doc: GenericDoc, leftId: ObjectId, rightId: ObjectId) => string
) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, collectionName), loadDocs(targetDb, collectionName).catch(() => [])]);
  const targetSignatures = new Set(targetDocs.map((doc) => signatureBuilder ? signatureBuilder(doc, objectIdValue(doc[leftField])!, objectIdValue(doc[rightField])!) : `${objectIdKey(doc[leftField])}|${objectIdKey(doc[rightField])}`));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const leftId = leftIds.get(objectIdKey(doc[leftField]));
    const rightId = rightIds.get(objectIdKey(doc[rightField]));

    if (!leftId || !rightId) {
      stats.skipped += 1;
      continue;
    }

    const signature = signatureBuilder ? signatureBuilder(doc, leftId, rightId) : `${leftId.toHexString()}|${rightId.toHexString()}`;

    if (targetSignatures.has(signature)) {
      stats.matchedExisting += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc[leftField] = leftId;
    insertDoc[rightField] = rightId;
    inserts.push(insertDoc);
    targetSignatures.add(signature);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection(collectionName).insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncToolActivity(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, toolIds: IdMap, collectionName: string) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, collectionName), loadDocs(targetDb, collectionName).catch(() => [])]);
  const targetSignatures = new Set(targetDocs.map((doc) => `${objectIdKey(doc.toolId)}|${dateKey(doc.bucketDate)}`));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const toolId = toolIds.get(objectIdKey(doc.toolId));

    if (!toolId) {
      stats.skipped += 1;
      continue;
    }

    const signature = `${toolId.toHexString()}|${dateKey(doc.bucketDate)}`;

    if (targetSignatures.has(signature)) {
      stats.matchedExisting += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc.toolId = toolId;
    inserts.push(insertDoc);
    targetSignatures.add(signature);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection(collectionName).insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncPaymentRecords(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, toolIds: IdMap) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "paymentrecords").catch(() => []), loadDocs(targetDb, "paymentrecords").catch(() => [])]);
  const targetSessions = new Set(targetDocs.map((doc) => stringValue(doc.stripeSessionId)));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const sessionId = stringValue(doc.stripeSessionId);
    const toolId = toolIds.get(objectIdKey(doc.toolId));

    if (!sessionId || !toolId) {
      stats.skipped += 1;
      continue;
    }

    if (targetSessions.has(sessionId)) {
      stats.matchedExisting += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc.toolId = toolId;
    inserts.push(insertDoc);
    targetSessions.add(sessionId);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("paymentrecords").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncSimpleCollection(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, collectionName: string, buildKey: (doc: GenericDoc) => string) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, collectionName).catch(() => []), loadDocs(targetDb, collectionName).catch(() => [])]);
  const targetKeys = new Set(targetDocs.map(buildKey).filter(Boolean));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const key = buildKey(doc);

    if (!key) {
      stats.skipped += 1;
      continue;
    }

    if (targetKeys.has(key)) {
      stats.matchedExisting += 1;
      continue;
    }

    inserts.push(cloneDoc(doc));
    targetKeys.add(key);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection(collectionName).insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncAccounts(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, userIds: IdMap) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "accounts").catch(() => []), loadDocs(targetDb, "accounts").catch(() => [])]);
  const targetKeys = new Set(targetDocs.map((doc) => `${stringValue(doc.provider)}|${stringValue(doc.providerAccountId)}`));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const key = `${stringValue(doc.provider)}|${stringValue(doc.providerAccountId)}`;
    const userId = userIds.get(objectIdKey(doc.userId));

    if (!key || !userId) {
      stats.skipped += 1;
      continue;
    }

    if (targetKeys.has(key)) {
      stats.matchedExisting += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc.userId = userId;
    inserts.push(insertDoc);
    targetKeys.add(key);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("accounts").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function syncSessions(sourceDb: ReturnType<MongoClient["db"]>, targetDb: ReturnType<MongoClient["db"]>, dryRun: boolean, userIds: IdMap) {
  const stats: SyncStats = { inserted: 0, matchedExisting: 0, skipped: 0 };
  const [sourceDocs, targetDocs] = await Promise.all([loadDocs(sourceDb, "sessions").catch(() => []), loadDocs(targetDb, "sessions").catch(() => [])]);
  const targetKeys = new Set(targetDocs.map((doc) => stringValue(doc.sessionToken)));
  const inserts: GenericDoc[] = [];

  for (const doc of sourceDocs) {
    const key = stringValue(doc.sessionToken);
    const userId = userIds.get(objectIdKey(doc.userId));

    if (!key || !userId) {
      stats.skipped += 1;
      continue;
    }

    if (targetKeys.has(key)) {
      stats.matchedExisting += 1;
      continue;
    }

    const insertDoc = cloneDoc(doc);
    insertDoc.userId = userId;
    inserts.push(insertDoc);
    targetKeys.add(key);
    stats.inserted += 1;
  }

  if (!dryRun && inserts.length) {
    await targetDb.collection("sessions").insertMany(inserts, { ordered: false });
  }

  return stats;
}

async function verifyAtlasData(targetDb: ReturnType<MongoClient["db"]>) {
  const sampleTool = await targetDb.collection("tools").findOne({ status: "approved" }, { projection: { name: 1 } });
  const sampleTerm = stringValue(sampleTool?.name).split(/\s+/).find((token) => token.length >= 3) ?? "";
  const summary = {
    approvedTools: await targetDb.collection("tools").countDocuments({ status: "approved" }),
    totalTools: await targetDb.collection("tools").countDocuments(),
    totalCategories: await targetDb.collection("categories").countDocuments(),
    totalUsers: await targetDb.collection("users").countDocuments(),
    totalFavorites: await targetDb.collection("favorites").countDocuments().catch(() => 0),
    totalSubmissions: await targetDb.collection("submissions").countDocuments().catch(() => 0),
    totalToolActivity: await targetDb.collection("toolactivities").countDocuments().catch(() => 0),
    searchSampleTerm: sampleTerm || null,
    searchResultCount: sampleTerm
      ? await targetDb.collection("tools").countDocuments({
          status: "approved",
          $or: [
            { name: { $regex: sampleTerm, $options: "i" } },
            { tagline: { $regex: sampleTerm, $options: "i" } },
            { description: { $regex: sampleTerm, $options: "i" } },
            { tags: { $elemMatch: { $regex: sampleTerm, $options: "i" } } },
            { categoryName: { $regex: sampleTerm, $options: "i" } }
          ]
        })
      : 0,
    categoriesWithTools: await orphanCount(targetDb, "tools", [{ $match: { status: "approved" } }, { $group: { _id: "$categorySlug" } }]),
    orphanFavorites: await orphanCount(targetDb, "favorites", [
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $lookup: { from: "tools", localField: "toolId", foreignField: "_id", as: "tool" } },
      { $match: { $or: [{ user: { $size: 0 } }, { tool: { $size: 0 } }] } }
    ]).catch(() => 0),
    orphanSubmissionUsers: await orphanCount(targetDb, "submissions", [
      { $match: { submittedBy: { $ne: null } } },
      { $lookup: { from: "users", localField: "submittedBy", foreignField: "_id", as: "user" } },
      { $match: { user: { $size: 0 } } }
    ]).catch(() => 0),
    orphanSubmissionTools: await orphanCount(targetDb, "submissions", [
      { $match: { approvedTool: { $ne: null } } },
      { $lookup: { from: "tools", localField: "approvedTool", foreignField: "_id", as: "tool" } },
      { $match: { tool: { $size: 0 } } }
    ]).catch(() => 0),
    orphanToolActivity: await orphanCount(targetDb, "toolactivities", [
      { $lookup: { from: "tools", localField: "toolId", foreignField: "_id", as: "tool" } },
      { $match: { tool: { $size: 0 } } }
    ]).catch(() => 0),
    orphanAuthAccounts: await orphanCount(targetDb, "accounts", [
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $match: { user: { $size: 0 } } }
    ]).catch(() => 0),
    orphanSessions: await orphanCount(targetDb, "sessions", [
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $match: { user: { $size: 0 } } }
    ]).catch(() => 0)
  };

  console.log("Verification summary:");
  console.log(`- approved tools: ${summary.approvedTools}`);
  console.log(`- total tools: ${summary.totalTools}`);
  console.log(`- total categories: ${summary.totalCategories}`);
  console.log(`- total users: ${summary.totalUsers}`);
  console.log(`- total favorites: ${summary.totalFavorites}`);
  console.log(`- total submissions: ${summary.totalSubmissions}`);
  console.log(`- total tool activity rows: ${summary.totalToolActivity}`);
  console.log(`- search sample term: ${summary.searchSampleTerm ?? "n/a"}`);
  console.log(`- search result count: ${summary.searchResultCount}`);
  console.log(`- categories with tools: ${summary.categoriesWithTools}`);
  console.log(`- orphan favorites: ${summary.orphanFavorites}`);
  console.log(`- orphan submission users: ${summary.orphanSubmissionUsers}`);
  console.log(`- orphan submission tools: ${summary.orphanSubmissionTools}`);
  console.log(`- orphan tool activity rows: ${summary.orphanToolActivity}`);
  console.log(`- orphan auth accounts: ${summary.orphanAuthAccounts}`);
  console.log(`- orphan sessions: ${summary.orphanSessions}`);

  if (summary.approvedTools === 0 || summary.searchResultCount === 0 || summary.categoriesWithTools === 0) {
    throw new Error("Atlas verification failed: tools, search, or category coverage is missing.");
  }

  if (summary.orphanFavorites || summary.orphanSubmissionUsers || summary.orphanSubmissionTools || summary.orphanToolActivity || summary.orphanAuthAccounts || summary.orphanSessions) {
    throw new Error("Atlas verification failed: orphaned relations were detected.");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  await loadEnvironmentFiles(workspaceRoot);

  const sourceUri = requiredEnv("MIGRATION_SOURCE_MONGODB_URI", DEFAULT_SOURCE_URI);
  const targetUri = requiredEnv("MONGODB_URI");
  const dbName = requiredEnv("MONGODB_DB_NAME", DEFAULT_DB_NAME);

  if (sourceUri === targetUri) {
    throw new Error("Source and target MongoDB URIs must be different.");
  }

  const sourceClient = new MongoClient(sourceUri, { serverSelectionTimeoutMS: 10_000 });
  const targetClient = new MongoClient(targetUri, { serverSelectionTimeoutMS: 10_000 });

  try {
    await Promise.all([sourceClient.connect(), targetClient.connect()]);
    const sourceDb = sourceClient.db(dbName);
    const targetDb = targetClient.db(dbName);
    const collections = new Set((await sourceDb.listCollections().toArray()).map((collection) => collection.name));

    console.log(`Source database: ${dbName}`);
    console.log(`Target database: ${dbName}`);

    if (options.verifyOnly) {
      await verifyAtlasData(targetDb);
      return;
    }

    const categoryIds: IdMap = new Map();
    const userIds: IdMap = new Map();
    const toolIds: IdMap = new Map();
    const submissionIds: IdMap = new Map();

    const categories = collections.has("categories") ? await syncCategories(sourceDb, targetDb, options.dryRun, categoryIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const users = collections.has("users") ? await syncUsers(sourceDb, targetDb, options.dryRun, userIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const tools = collections.has("tools") ? await syncTools(sourceDb, targetDb, options.dryRun, categoryIds, userIds, toolIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const submissions = collections.has("submissions") ? await syncSubmissions(sourceDb, targetDb, options.dryRun, categoryIds, userIds, toolIds, submissionIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const toolSubmissionLinks = collections.has("tools") && collections.has("submissions") ? await patchToolSubmissionLinks(sourceDb, targetDb, options.dryRun, toolIds, submissionIds) : 0;
    const favorites = collections.has("favorites") ? await syncFavorites(sourceDb, targetDb, options.dryRun, userIds, toolIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const toolActivityCollection = collections.has("toolactivities") ? "toolactivities" : collections.has("toolActivity") ? "toolActivity" : "";
    const toolActivity = toolActivityCollection ? await syncToolActivity(sourceDb, targetDb, options.dryRun, toolIds, toolActivityCollection) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const reviews = collections.has("reviews") ? await syncReviews(sourceDb, targetDb, options.dryRun, userIds, toolIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const payments = collections.has("paymentrecords") ? await syncPaymentRecords(sourceDb, targetDb, options.dryRun, toolIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const externalSearchCache = collections.has("externalsearchcaches") ? await syncSimpleCollection(sourceDb, targetDb, options.dryRun, "externalsearchcaches", (doc) => stringValue(doc.cacheKey)) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const accounts = collections.has("accounts") ? await syncAccounts(sourceDb, targetDb, options.dryRun, userIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const sessions = collections.has("sessions") ? await syncSessions(sourceDb, targetDb, options.dryRun, userIds) : { inserted: 0, matchedExisting: 0, skipped: 0 };
    const verificationTokens = collections.has("verification_tokens") ? await syncSimpleCollection(sourceDb, targetDb, options.dryRun, "verification_tokens", (doc) => `${stringValue(doc.identifier)}|${stringValue(doc.token)}`) : { inserted: 0, matchedExisting: 0, skipped: 0 };

    printStats("categories", categories);
    printStats("users", users);
    printStats("tools", tools);
    printStats("submissions", submissions);
    console.log(`tool.sourceSubmission link patches: ${toolSubmissionLinks}`);
    printStats("favorites", favorites);
    printStats("tool activity", toolActivity);
    printStats("reviews", reviews);
    printStats("payment records", payments);
    printStats("external search cache", externalSearchCache);
    printStats("auth accounts", accounts);
    printStats("auth sessions", sessions);
    printStats("verification tokens", verificationTokens);

    if (options.dryRun) {
      console.log("Dry run complete. No Atlas writes were applied.");
      return;
    }

    await verifyAtlasData(targetDb);
  } finally {
    await Promise.allSettled([sourceClient.close(), targetClient.close()]);
  }
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
