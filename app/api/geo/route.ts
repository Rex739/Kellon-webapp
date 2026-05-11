import { NextResponse, NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    // 1. Check for standard proxy headers first (Vercel/Cloudflare/Railway)
    const headerCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code")

    if (headerCountry) {
      return NextResponse.json({ country: headerCountry.toUpperCase() })
    }

    // 2. Fallback to ip-api.com (More reliable for local/VPS dev than ipapi.co)
    // Note: Use http for the free tier of this specific API
    const res = await fetch("http://ip-api.com/json/", {
      next: { revalidate: 3600 }, // Cache for 1 hour to stay under limits
    })

    if (!res.ok) throw new Error("External Geo API failed")

    const data = await res.json()
    const countryCode = data.countryCode?.toUpperCase() || "NG"

    return NextResponse.json(
      { country: countryCode, country_code: countryCode },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("Geo proxy error:", error)
    // Fallback to NG so the app doesn't break
    return NextResponse.json({ country: "NG", country_code: "NG" })
  }
}
