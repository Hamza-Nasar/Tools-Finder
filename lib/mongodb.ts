import mongoose from "mongoose";
import { env } from "@/lib/env";

declare global {
  var mongooseCache:
    | {
        connection: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        uri: string | null;
      }
    | undefined;
  var mongooseEventsBound: boolean | undefined;
}

const mongooseCache = global.mongooseCache ?? {
  connection: null,
  promise: null,
  uri: null
};

mongoose.set("bufferCommands", false);

function resetMongooseCache() {
  mongooseCache.connection = null;
  mongooseCache.promise = null;
  mongooseCache.uri = null;
  global.mongooseCache = mongooseCache;
}

if (!global.mongooseEventsBound) {
  mongoose.connection.on("disconnected", () => {
    resetMongooseCache();
  });

  mongoose.connection.on("error", () => {
    resetMongooseCache();
  });

  global.mongooseEventsBound = true;
}

export async function connectToDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const readyState = mongoose.connection.readyState;
  const uriChanged = mongooseCache.uri && mongooseCache.uri !== env.MONGODB_URI;

  if (uriChanged) {
    resetMongooseCache();
  }

  if (mongooseCache.connection && readyState === 1) {
    return mongooseCache.connection;
  }

  if (mongooseCache.promise && readyState === 2 && !uriChanged) {
    return mongooseCache.promise;
  }

  resetMongooseCache();
  mongooseCache.uri = env.MONGODB_URI;
  mongooseCache.promise = mongoose
    .connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME ?? "ai-tools-finder",
      serverSelectionTimeoutMS: 3_000
    })
    .then((connection) => {
      mongooseCache.connection = connection;
      return connection;
    })
    .catch((error) => {
      resetMongooseCache();
      throw error;
    });

  mongooseCache.connection = await mongooseCache.promise;
  global.mongooseCache = mongooseCache;

  return mongooseCache.connection;
}
