import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    role: string;
    token: string;
    fullName: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      fullName: string;
      accessToken: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role: string;
    fullName: string;
    accessToken: string;
  }
}