import NextAuth, { DefaultSession, type NextAuthConfig } from "next-auth"
import Mailgun from "next-auth/providers/mailgun"
import Google from "next-auth/providers/google"
import { sendVerificationRequest } from "./lib/authSendRequest"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import { Chapter, Folder, PrismaClient, Question, Role, Subject, UserPreferences, UserTest } from "@prisma/client"
import type { Provider } from "next-auth/providers"
import { type Adapter } from "next-auth/adapters";

/**
 * Extindem modelul standard `UserTest` pentru a include datele relaționate
 * necesare în sesiunea utilizatorului, precum întrebările, folderul, materiile și capitolele.
 */
export interface UserActiveTest extends UserTest {
  questions: Question[], 
  folder: Folder | null, 
  subjects: Subject[] | null, 
  chapters: Chapter[] | null, 
}

/**
 * Personalizăm adaptorul Prisma pentru a gestiona explicit erorile
 * ce pot apărea în timpul operațiunii de ștergere a sesiunii.
 * @param p Instanța clientului Prisma.
 * @returns Un adaptor NextAuth cu funcționalitatea `deleteSession` modificată.
 */
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
        console.error("Error deleting session:", error);
        return null;
      }
    },
  } as Adapter;
}

// Definim furnizorii de autentificare utilizați în aplicație.
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

// Generăm o mapă a furnizorilor disponibili pentru utilizare în interfața de autentificare.
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

// Configurăm opțiunile principale pentru NextAuth.
export const authOptions: NextAuthConfig = {
  debug: (process.env.AUTH_DEBUG == "true" || process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "development" || process.env.VERCEL_ENV === "preview") && process.env.AUTH_DEBUG !== "false",
  adapter: CustomPrismaAdapter(prisma),
  providers,
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    verifyRequest: "/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    /**
     * Modificăm obiectul `session` pentru a include date suplimentare specifice aplicației,
     * precum rolurile utilizatorului, preferințele și testele active.
     * Această funcție este apelată la crearea sau verificarea unei sesiuni.
     */
    async session({ session, user }) {
      const userTests = await prisma.userTest.findMany({
        where: { userId: user.id },
        include: { questions: { include: { question: true } } }
      });

      const userActiveTests = await Promise.all(
        userTests.map(async (test) => {
          const folder = test.folderId ? await prisma.folder.findUnique({ where: { id: test.folderId } }) : null;
          const subjects = test.subjectId ? await prisma.subject.findMany({ where: { id: { in: test.subjectId } } }) : null;
          const chapters = test.chapterId ? await prisma.chapter.findMany({ where: { id: { in: test.chapterId } } }) : null;
          const questions = test.questions.map((utq) => utq.question);
          return { ...test, folder, subjects, questions, chapters };
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

// Exportăm funcțiile și obiectele generate de NextAuth pe baza configurației definite.
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth(authOptions)

// Extindem interfețele standard NextAuth pentru a include tipurile personalizate în definiția sesiunii și a utilizatorului.
declare module "next-auth" {
  /**
   * Definește structura obiectului `session` utilizat în aplicație,
   * incluzând proprietățile personalizate adăugate.
   */
  interface Session {
    user: {
      /** Rolurile pe care le are utilizatorul. */
      roles: Role[]
      /** Testele pe care le-a început și nu le-a terminat. */
      activeTests?: UserActiveTest[]
      /** Preferințele utilizatorului (limbă, temă etc.). */
      preferences: UserPreferences
      /** Flag care ne zice dacă userul e aprobat de admini. */
      userAuthorized: boolean
      /** Username-ul ales de utilizator. */
      username?: string | null
    } & DefaultSession["user"]
  }
  /**
   * Definește structura obiectului `User` utilizat intern de NextAuth,
   * incluzând proprietățile personalizate adăugate.
   */
  interface User {
    roles?: Role[],
    activeTests?: UserActiveTest[],
    preferences: UserPreferences
    userAuthorized?: boolean
    username?: string | null
  }
}