import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const onboarded = request.cookies.get("kellon_onboarded")?.value
  const isAuth = request.cookies.get("kellon_auth")?.value

  const { pathname } = request.nextUrl

  // 1. Not onboarded → force onboarding
  if (!onboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  // 2. Onboarded but not authenticated → go to login
  if (onboarded && !isAuth && pathname !== "/continue") {
    return NextResponse.redirect(new URL("/continue", request.url))
  }

  // 3. Authenticated → block onboarding + login
  if (isAuth && (pathname === "/onboarding" || pathname === "/continue")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Apply to all routes except internal ones
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
}
