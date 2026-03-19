import { MongoClient } from "mongodb";
import { env } from "@/lib/env";

declare global {
  var mongoClientCache:
    | {
        client: MongoClient | null;
        promise: Promise<MongoClient> | null;
        uri: string | null;
      }
    | undefined;
}

const mongoClientCache = global.mongoClientCache ?? {
  client: null,
  promise: null,
  uri: null
};

function resetMongoClientCache() {
  mongoClientCache.client = null;
  mongoClientCache.promise = null;
  mongoClientCache.uri = null;
  global.mongoClientCache = mongoClientCache;
}

export async function getMongoClient() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const uriChanged = mongoClientCache.uri && mongoClientCache.uri !== env.MONGODB_URI;

  if (uriChanged) {
    resetMongoClientCache();
  }

  if (mongoClientCache.client && mongoClientCache.uri === env.MONGODB_URI) {
    return mongoClientCache.client;
  }

  if (!mongoClientCache.promise) {
    const client = new MongoClient(env.MONGODB_URI);
    mongoClientCache.uri = env.MONGODB_URI;
    mongoClientCache.promise = client.connect().then((connectedClient) => {
      mongoClientCache.client = connectedClient;
      return connectedClient;
    });
  }

  try {
    const client = await mongoClientCache.promise;
    global.mongoClientCache = mongoClientCache;
    return client;
  } catch (error) {
    resetMongoClientCache();
    throw error;
  }
}
