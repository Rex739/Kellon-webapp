import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isLoggedIn = Boolean(request.cookies.get("auth_token"))
  const { pathname } = request.nextUrl

  // Allow access to login/signup without redirecting
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth-callback")
  ) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
