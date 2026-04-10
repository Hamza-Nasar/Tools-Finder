import mongoose from "mongoose";
import { isDatabaseUnavailableError } from "@/lib/errors";
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
  var databaseAvailabilityState:
    | {
        unavailableUntil: number;
      }
    | undefined;
}

const mongooseCache = global.mongooseCache ?? {
  connection: null,
  promise: null,
  uri: null
};
const databaseAvailabilityState = global.databaseAvailabilityState ?? {
  unavailableUntil: 0
};
const DATABASE_UNAVAILABLE_RETRY_MS = 30_000;

mongoose.set("bufferCommands", false);
global.databaseAvailabilityState = databaseAvailabilityState;

function resetMongooseCache() {
  mongooseCache.connection = null;
  mongooseCache.promise = null;
  mongooseCache.uri = null;
  global.mongooseCache = mongooseCache;
}

function markDatabaseUnavailable() {
  databaseAvailabilityState.unavailableUntil = Date.now() + DATABASE_UNAVAILABLE_RETRY_MS;
  global.databaseAvailabilityState = databaseAvailabilityState;
}

function clearDatabaseUnavailable() {
  databaseAvailabilityState.unavailableUntil = 0;
  global.databaseAvailabilityState = databaseAvailabilityState;
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
      dbName: env.MONGODB_DB_NAME ?? "aitoolsfinder",
      serverSelectionTimeoutMS: 3_000
    })
    .then((connection) => {
      clearDatabaseUnavailable();
      mongooseCache.connection = connection;
      return connection;
    })
    .catch((error) => {
      if (isDatabaseUnavailableError(error)) {
        markDatabaseUnavailable();
      }

      resetMongooseCache();
      throw error;
    });

  mongooseCache.connection = await mongooseCache.promise;
  global.mongooseCache = mongooseCache;
  clearDatabaseUnavailable();

  return mongooseCache.connection;
}

export async function isDatabaseAvailable() {
  if (!env.MONGODB_URI) {
    return false;
  }

  if (mongooseCache.connection && mongoose.connection.readyState === 1) {
    return true;
  }

  if (databaseAvailabilityState.unavailableUntil > Date.now()) {
    return false;
  }

  try {
    await connectToDatabase();
    return true;
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return false;
    }

    throw error;
  }
}
