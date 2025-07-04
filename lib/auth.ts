import type { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import CredentialsProvider from "next-auth/providers/credentials"

/**
 * Instantiate the Supabase adapter *only* when both env-vars exist.
 * This prevents a build-time crash if someone builds without secrets.
 */
const adapter =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
      })
    : undefined

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: "Guest",
      credentials: {},
      async authorize() {
        // Always return null – used only so that at least one provider exists
        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
  },
}
