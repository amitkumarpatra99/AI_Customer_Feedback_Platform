import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { workspace: true }
        });

        if (!user) {
          return null;
        }

        // TODO: Validate password (to be implemented with hashing on Day 3)
        // For now, allow seed password or basic check
        if (credentials.password !== "Password123" && user.passwordHash !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
          workspaceName: user.workspace.name
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.workspaceId = user.workspaceId;
        token.workspaceName = user.workspaceName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.workspaceId = token.workspaceId;
        session.user.workspaceName = token.workspaceName;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  }
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function hasRole(session: any, allowedRoles: string[]) {
  return allowedRoles.includes(session.user.role);
}

// Extend next-auth types
declare module "next-auth" {
  interface User {
    role: "ADMIN" | "ANALYST" | "VIEWER";
    workspaceId: string;
    workspaceName: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: "ADMIN" | "ANALYST" | "VIEWER";
      workspaceId: string;
      workspaceName: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "ANALYST" | "VIEWER";
    workspaceId: string;
    workspaceName: string;
  }
}
