import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Protect all `/dashboard/**` routes:
 * • If there is no active NextAuth token → redirect to /auth/signin
 * • Else allow the request to continue
 */
export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuth = Boolean(token)
  const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboardRoute && !isAuth) {
    const signinUrl = new URL("/auth/signin", req.url)
    signinUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
