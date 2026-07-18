import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const requestUrl = new URL(request.url)
  let origin = requestUrl.origin
  if (origin.startsWith("http://") && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    origin = origin.replace("http://", "https://")
  }

  try {
    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from("profiles")
            .update({
              avatar_url: user.user_metadata?.avatar_url || "",
              login_method: user.app_metadata?.provider || "email",
            })
            .eq("id", user.id)
        }

        const forwardedHost = request.headers.get("x-forwarded-host")
        const isLocalEnv = process.env.NODE_ENV === "development"
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}/dashboard/profile`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}/dashboard/profile`)
        } else {
          return NextResponse.redirect(`${origin}/dashboard/profile`)
        }
      } else {
        console.error("Exchange code error:", error)
        return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(error.message)}`)
      }
    }
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  } catch (err: unknown) {
    console.error("Critical Auth Callback exception:", err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
