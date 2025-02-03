import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import Mailgun from "next-auth/providers/mailgun"
import Google from "next-auth/providers/google"
import { sendVerificationRequest } from "./lib/authSendRequest"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    Mailgun({
      name: "email",
      from: process.env.MAILGUN_FROM,
      sendVerificationRequest: sendVerificationRequest
    })
  ],
  callbacks: {
    session({ session, user }) {
      // `session.user.roles` is now a valid property, and will be type-checked
      // in places like `useSession().data.user` or `auth().user`
      return {
        ...session,
        user: {
          ...session.user,
          roles: user.roles,
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
      roles: string[]
      userAuthorized: boolean
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
  interface User {
    roles?: string[]
    userAuthorized?: boolean
  } 
}