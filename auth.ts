import NextAuth, { DefaultSession } from "next-auth"
import Mailgun from "next-auth/providers/mailgun"
import Google from "next-auth/providers/google"
import { sendVerificationRequest } from "./lib/authSendRequest"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import { Role } from "@prisma/client"

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Mailgun({
      name: "email",
      from: process.env.MAILGUN_FROM,
      sendVerificationRequest: sendVerificationRequest
    }),
    Google
  ],
  callbacks: {
    async session({ session, user }) {
      // `session.user.roles` is now a valid property, and will be type-checked
      // in places like `useSession().data.user` or `auth().user`
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
          username: user.username,
          userAuthorized: user.userAuthorized
        },
      }
    },
  },
})

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's roles. */
      roles: Role[]
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
    roles?: Role[]
    userAuthorized?: boolean
    username?: string | null
  } 
}