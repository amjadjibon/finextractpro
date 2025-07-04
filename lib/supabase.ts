import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Lazy-instantiate the *browser* client the first time it’s needed.
 * Keeps `createClient()` from running during `next build`, which
 * prevents “supabaseUrl is required” errors for pages like `_not-found`.
 */
let supabaseBrowserClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (supabaseBrowserClient) return supabaseBrowserClient

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase env vars.")
  }

  supabaseBrowserClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return supabaseBrowserClient
}

/**
 * createServerClient() — named export required by the build output.
 * This helper can be used inside Route Handlers / Server Actions.
 * It is *also* completely lazy, so importing the function is safe
 * during the static generation phase.
 */
import type { cookies } from "next/headers"
import { createServerClient as _createServerClient } from "@supabase/ssr"

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase env vars.")
  }

  return _createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { get: cookieStore.get, set: cookieStore.set, remove: cookieStore.delete },
  })
}
