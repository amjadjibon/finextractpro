import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function middleware(req: NextRequest) {
  try {
    const supabase = await createServerClient(cookies())
    const { data: { session } } = await supabase.auth.getSession()
    
    const isAuth = Boolean(session?.user)
    const { pathname } = req.nextUrl

    if (pathname.startsWith("/dashboard") && !isAuth) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, redirect to sign-in for protected routes
    const { pathname } = req.nextUrl
    if (pathname.startsWith("/dashboard")) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
