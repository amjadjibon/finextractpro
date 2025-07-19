import { getSupabaseClient, createServerClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export type AuthUser = User | null

/**
 * Get the current user session on the client side
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || `${window.location.origin}/dashboard`
    }
  })
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

// Server-side functions
export const serverAuth = {
  /**
   * Get the current user session on the server side
   */
  async getCurrentUser(): Promise<AuthUser> {
    const { cookies } = await import("next/headers")
    const supabase = await createServerClient(cookies())
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  /**
   * Get the current session on the server side
   */
  async getSession() {
    const { cookies } = await import("next/headers")
    const supabase = await createServerClient(cookies())
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  /**
   * Check if user is authenticated on server side
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }
}

// Legacy exports for backward compatibility
export const getCurrentUserServer = serverAuth.getCurrentUser
export const getSessionServer = serverAuth.getSession
export const isAuthenticatedServer = serverAuth.isAuthenticated
