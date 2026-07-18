import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/?error=init_failed`)
  }

  return NextResponse.redirect(data.url)
}
