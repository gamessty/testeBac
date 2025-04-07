import NextAuth, { DefaultSession, type NextAuthConfig } from "next-auth"
import Mailgun from "next-auth/providers/mailgun"
import Google from "next-auth/providers/google"
import { sendVerificationRequest } from "./lib/authSendRequest"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import { Folder, PrismaClient, Question, Role, Subject, UserPreferences, UserTest } from "@prisma/client"
import type { Provider } from "next-auth/providers"
import { type Adapter } from "next-auth/adapters";

export interface UserActiveTest extends UserTest {
  questions: Question[],
  folder: Folder | null,
  subjects: Subject[] | null,
}

function CustomPrismaAdapter(p: PrismaClient): Adapter {
  const originalAdapter = PrismaAdapter(p);
  return {
    ...originalAdapter,
    deleteSession: async (sessionToken: string) => {
      try {
        const session = await p.session.findUnique({
          where: { sessionToken },
        });

        if (!session) {
          return null;
        }

        return await p.session.delete({
          where: { sessionToken },
        });
      } catch (error) {
        console.error("Failed to delete session", error);
        return null;
      }
    },
  } as Adapter;
}

const providers: Provider[] = [
  Mailgun({
    name: "email",
    from: process.env.MAILGUN_FROM,
    sendVerificationRequest: sendVerificationRequest
  }),
  Google({
    allowDangerousEmailAccountLinking: true,
  })
]

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name, type: providerData.type }
    } else {
      return { id: provider.id, name: provider.name, type: provider.type }
    }
  })
  .filter((provider) => provider.id !== "credentials")

export const authOptions: NextAuthConfig = {
  debug: (process.env.AUTH_DEBUG == "true" || process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development" || process.env.VERCEL_ENV === "preview") && process.env.AUTH_DEBUG !== "false",
  adapter: CustomPrismaAdapter(prisma),
  providers,
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify-request",
  },
  callbacks: {
    async session({ session, user }) {
      const userTests = await prisma.userTest.findMany({
        where: { userId: user.id },
        include: { questions: { include: { question: true } } } // Include related questions
      });

      const userActiveTests = await Promise.all(
        userTests.map(async (test) => {
          const folder = test.folderId ? await prisma.folder.findUnique({ where: { id: test.folderId } }) : null; // Include folder if folderId is present
          const subjects = test.subjectId ? await prisma.subject.findMany({ where: { id: { in: test.subjectId } } }) : null; // Include subjects if subjectId is present
          const questions = test.questions.map((utq) => utq.question); // Extract questions
          return { ...test, folder, subjects, questions };
        })
      );

      const roles = await prisma.role.findMany({
        where: {
          userIDs: {
            hasSome: [user.id]
          }
        }
      });
      return {
        ...session,
        user: {
          ...session.user,
          roles,
          preferences: user.preferences,
          activeTests: userActiveTests,
          username: user.username,
          userAuthorized: user.userAuthorized
        },
      };
    },
  },
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth(authOptions)

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's roles. */
      roles: Role[]
      activeTests?: UserActiveTest[]
      preferences: UserPreferences
      userAuthorized: boolean
      username?: string | null
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
  interface User {
    roles?: Role[],
    activeTests?: UserActiveTest[],
    preferences: UserPreferences
    userAuthorized?: boolean
    username?: string | null
  }
}