// app/api/geo/route.ts (App Router)
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://ipapi.co/json/")
    if (!res.ok) throw new Error(`ipapi.co responded with ${res.status}`)
    const data = await res.json()
    // Return only the country code to minimise data
    return NextResponse.json({ country: data.country_code })
  } catch (error) {
    console.error("Geo proxy error:", error)
    // Fallback to a sensible default (NG)
    return NextResponse.json({ country: "NG" })
  }
}
