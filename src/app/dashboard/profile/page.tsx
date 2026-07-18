import { createClient } from "@/utils/supabase/server"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  if (isSupabasePlaceholder()) {
    return redirect("/")
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/")
  }

  // Fetch current user profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, main_account, full_name")
    .eq("id", user.id)
    .maybeSingle()

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = profile?.full_name || user.user_metadata?.full_name || "Agent User"
  const mainAccount = profile?.main_account || user.user_metadata?.name || user.user_metadata?.preferred_username || "anonymous"
  const initialNickname = profile?.nickname || ""

  return (
    <div className="min-h-screen bg-page text-body flex flex-col font-sans">
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="AStrategy" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-base font-medium tracking-tight bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
                AStrategy
              </h1>
              <p className="text-[10px] text-muted font-medium tracking-wider uppercase">
                Intelligence Center
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AuthHeader />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <ProfileForm
          initialNickname={initialNickname}
          fullName={fullName}
          mainAccount={mainAccount}
          avatarUrl={avatarUrl}
        />
      </main>
    </div>
  )
}
