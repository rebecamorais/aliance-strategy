import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful login. Redirect to internal protected area
      return NextResponse.redirect(`${siteUrl}/dashboard/profile`)
    }
  }

  // Authentication failed or code missing
  return NextResponse.redirect(`${siteUrl}/?error=auth_failed`)
}
