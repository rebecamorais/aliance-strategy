import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  let origin = requestUrl.origin
  if (origin.startsWith("http://") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    origin = origin.replace("http://", "https://")
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("OAuth init error:", error)
      return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.url) {
      console.error("OAuth URL missing")
      return NextResponse.redirect(`${origin}/?error=no_url`)
    }

    return NextResponse.redirect(data.url)
  } catch (err: unknown) {
    console.error("Critical OAuth exception:", err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
