import { ok } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  let database = "unavailable";

  try {
    await connectToDatabase();
    database = "connected";
  } catch {
    database = "unavailable";
  }

  return ok({
    status: database === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    services: {
      database
    }
  });
}
