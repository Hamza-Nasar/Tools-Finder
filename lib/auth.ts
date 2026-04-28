import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/env";
import { getMongoClient } from "@/lib/mongo-client";
import { UserService } from "@/lib/services/user-service";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(() => getMongoClient(), {
    databaseName: env.MONGODB_DB_NAME ?? "aitoolsfinder"
  }),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        return UserService.authenticateWithPassword({
          email: credentials.email,
          password: credentials.password
        });
      }
    }),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
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
      : [])
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account?.provider || !["google", "credentials"].includes(account.provider)) {
        return false;
      }

      if (
        account.provider === "google" &&
        profile &&
        "email_verified" in profile &&
        profile.email_verified === false
      ) {
        return false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        const syncedUser = await UserService.syncUser({
          id: user.id ?? token.sub ?? null,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          role: user.role ?? null,
          loginProvider: account?.provider === "google" || account?.provider === "credentials" ? account.provider : null
        });

        token.sub = syncedUser.id;
        token.name = syncedUser.name;
        token.email = syncedUser.email;
        token.picture = syncedUser.image ?? null;
        token.role = syncedUser.role;
        token.plan = syncedUser.plan;
        token.billingCycle = syncedUser.billingCycle ?? null;
        token.trialEndsAt = syncedUser.trialEndsAt ?? null;
      } else if (token.sub || token.email) {
        const refreshedUser = await UserService.refreshSessionUser({
          id: token.sub ?? null,
          email: typeof token.email === "string" ? token.email : null
        });

        if (refreshedUser) {
          token.sub = refreshedUser.id;
          token.name = refreshedUser.name;
          token.email = refreshedUser.email;
          token.picture = refreshedUser.image ?? null;
          token.role = refreshedUser.role;
          token.plan = refreshedUser.plan;
          token.billingCycle = refreshedUser.billingCycle ?? null;
          token.trialEndsAt = refreshedUser.trialEndsAt ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role === "admin" ? "admin" : "user";
        session.user.plan =
          token.plan === "pro" || token.plan === "vendor" || token.plan === "free" ? token.plan : "free";
        session.user.billingCycle =
          token.billingCycle === "monthly" || token.billingCycle === "yearly" ? token.billingCycle : null;
        session.user.trialEndsAt = typeof token.trialEndsAt === "string" ? token.trialEndsAt : null;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = typeof token.picture === "string" ? token.picture : null;
      }

      return session;
    }
  }
};
