import { AppError } from "@/lib/errors";
import { getSafeServerSession } from "@/lib/safe-session";

export async function getOptionalSession() {
  return getSafeServerSession();
}

export async function requireAuthenticatedSession() {
  const session = await getSafeServerSession();

  if (!session?.user) {
    throw new AppError(401, "Authentication required.", "UNAUTHORIZED");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getSafeServerSession();

  if (!session?.user || session.user.role !== "admin") {
    throw new AppError(403, "Admin access required.", "FORBIDDEN");
  }

  return session;
}
