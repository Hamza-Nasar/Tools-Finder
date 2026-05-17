import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function getOptionalSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

export async function requireAuthenticatedSession() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session?.user) {
    throw new AppError(401, "Authentication required.", "UNAUTHORIZED");
  }

  return session;
}

export async function requireAdminSession() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session?.user || session.user.role !== "admin") {
    throw new AppError(403, "Admin access required.", "FORBIDDEN");
  }

  return session;
}
