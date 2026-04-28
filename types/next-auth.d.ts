import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "user" | "admin";
      plan: "free" | "pro" | "vendor";
      billingCycle?: "monthly" | "yearly" | null;
      trialEndsAt?: string | null;
    };
  }

  interface User extends DefaultUser {
    id?: string;
    role?: "user" | "admin";
    plan?: "free" | "pro" | "vendor";
    billingCycle?: "monthly" | "yearly" | null;
    trialEndsAt?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: "user" | "admin";
    plan?: "free" | "pro" | "vendor";
    billingCycle?: "monthly" | "yearly" | null;
    trialEndsAt?: string | null;
  }
}
