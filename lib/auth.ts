import GitHub from "next-auth/providers/github";

import { constant } from "@/configs/constant";
import { prisma } from "@/lib/prisma";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

const { NEXTAUTH_SECRET } = constant;
const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  experimental: { enableWebAuthn: true },
  providers: [
    GitHub({
      profile: (profile) => {
        return {
          id: profile.id?.toString() || "",
          name: profile.name || profile.login || "Unknown",
          email: profile.email || "No email provided",
          image: profile.avatar_url || null,
          username: profile.login || "Unknown",
        };
      },
    }),
  ],
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signOut: "/",
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
    jwt({ token, trigger, user, session}) {
      if (user?.role) token.role = user.role;
      if (trigger === "update") token.name = session.user.name;
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.role && session.user) session.user.role = token.role as string;
      if (token?.accessToken) session.accessToken = token.accessToken as string;
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

export const { auth, handlers } = NextAuth(authOptions);
