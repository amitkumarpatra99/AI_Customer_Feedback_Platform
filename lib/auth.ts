import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

// Set NEXTAUTH_URL fallback in production if not set (for Vercel compatibility)
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { workspace: true },
        });

        // Use bcrypt to compare entered password with the stored hash
        if (user && await bcrypt.compare(credentials.password, user.passwordHash)) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            workspaceId: user.workspaceId,
            workspaceName: user.workspace.name,
          };
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.workspaceId = user.workspaceId;
        token.workspaceName = user.workspaceName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.workspaceId = token.workspaceId as string;
        session.user.workspaceName = token.workspaceName as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return await getServerSession(authOptions);
}