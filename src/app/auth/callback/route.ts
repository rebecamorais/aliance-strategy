import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successful login. Redirect to internal protected area
      return NextResponse.redirect(`${origin}/dashboard/profile`)
    }
  }

  // Authentication failed or code missing
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
