import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";

export async function getOptionalSession() {
  return getServerSession(authOptions);
}

export async function requireAuthenticatedSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AppError(401, "Authentication required.", "UNAUTHORIZED");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    throw new AppError(403, "Admin access required.", "FORBIDDEN");
  }

  return session;
}
