import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "superadmin" | "admin" | "user";
    } & DefaultSession["user"];
  }

  interface User {
    role: "superadmin" | "admin" | "user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "superadmin" | "admin" | "user";
  }
}
