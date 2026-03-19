import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/env";
import { getMongoClient } from "@/lib/mongo-client";
import { UserService } from "@/lib/services/user-service";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(() => getMongoClient(), {
    databaseName: env.MONGODB_DB_NAME ?? "aitoolsfinder"
  }),
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error"
  },
  providers:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            httpOptions: {
              timeout: env.AUTH_HTTP_TIMEOUT_MS ?? 15000
            }
          })
        ]
      : [],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "google") {
        return false;
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const syncedUser = await UserService.syncUser({
          id: user?.id ?? session.user.id ?? null,
          name: session.user.name ?? user?.name ?? null,
          email: session.user.email ?? user?.email ?? null,
          image: session.user.image ?? user?.image ?? null,
          role: null
        });

        session.user.id = syncedUser.id;
        session.user.role = syncedUser.role;
        session.user.image = syncedUser.image ?? session.user.image ?? null;
      }

      return session;
    }
  }
};
