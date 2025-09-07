import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { upsertUser } from "./database"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Save user to database on sign-in
      if (account?.provider === "google" && profile?.sub) {
        try {
          await upsertUser({
            google_id: profile.sub,
            email: user.email!,
            name: user.name || undefined,
            image_url: user.image || undefined,
          })
          return true
        } catch (error) {
          console.error("Error saving user to database:", error)
          // Still allow sign-in even if database save fails
          return true
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.id = profile?.sub
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
