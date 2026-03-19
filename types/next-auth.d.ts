import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "user" | "admin";
    };
  }

  interface User extends DefaultUser {
    id?: string;
    role?: "user" | "admin";
  }
}
