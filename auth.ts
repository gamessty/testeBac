import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "./lib/db"
import Mailgun from "next-auth/providers/mailgun"
import Google from "next-auth/providers/google"
import { sendVerificationRequest } from "./lib/authSendRequest"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(client, {
    databaseName: process.env.MONGODB_DB_NAME
  }),
  providers: [
    Google,
    Mailgun({
      name: "email",
      from: process.env.MAILGUN_FROM,
      sendVerificationRequest: sendVerificationRequest
    })
  ],
})