import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * ---------------
 *  Browser client
 * ---------------
 * Returned with `getSupabaseClient()`.
 * • Instantiated lazily so that _no_ Supabase code executes during
 *   `next build`, preventing “supabaseUrl is required” errors that occur
 *   when env-vars aren’t present in the build environment.
 */
let browserClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  browserClient = createClient(url, anon)
  return browserClient
}

/**
 * ----------------
 *  Server-side API
 * ----------------
 * Exported as `createServerClient` (Vercel build script expects this name).
 * Use inside Route Handlers / Server Actions only.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
