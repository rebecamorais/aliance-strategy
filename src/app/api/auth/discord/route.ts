import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${siteUrl}/?error=init_failed`)
  }

  return NextResponse.redirect(data.url)
}
