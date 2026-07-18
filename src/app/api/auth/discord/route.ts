import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  let origin = requestUrl.origin
  if (origin.startsWith("http://") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    origin = origin.replace("http://", "https://")
  }

  try {
    const clientPromise = createClient()
    const clientTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("createClient() timed out (5s limit)")), 5000)
    )
    const supabase = await Promise.race([clientPromise, clientTimeout])

    const oauthPromise = supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
    const oauthTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("signInWithOAuth() network request timed out (10s limit)")), 10000)
    )
    const { data, error } = await Promise.race([oauthPromise, oauthTimeout])

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
