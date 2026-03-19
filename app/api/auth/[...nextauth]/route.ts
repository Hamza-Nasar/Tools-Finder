import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/services/user-service";

const nextAuthHandler = NextAuth(authOptions);

async function handler(...args: Parameters<typeof nextAuthHandler>) {
  await UserService.ensureAuthUserCompatibility();
  return nextAuthHandler(...args);
}

export { handler as GET, handler as POST };
