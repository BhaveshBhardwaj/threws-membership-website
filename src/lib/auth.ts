import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import authConfig from "@/lib/auth.config";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        await dbConnect();

        // 1. Support signing in using generated WBR Academic Credentials
        const { default: Member } = await import("@/models/Member");
        const member = await Member.findOne({ orgEmail: email.toLowerCase() });
        if (member && member.orgEmailPassword === password) {
          const user = await User.findOne({ email: member.email.toLowerCase() });
          if (user) {
            await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.avatar ?? null,
            };
          }
        }

        // 2. Standard sign-in using registered personal email and password
        const user = await User.findOne({ email: email.toLowerCase() }).select(
          "+password"
        );

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Update last login timestamp
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.avatar ?? null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    ...authConfig.callbacks,
  },
});
