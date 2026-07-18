import { createClient } from "@/utils/supabase/server"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { User, Search } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

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

  const avatarUrl = user.user_metadata?.avatar_url
  const fullName = user.user_metadata?.full_name || "Agent User"
  const nickname = user.user_metadata?.name || user.user_metadata?.preferred_username || "anonymous"

  return (
    <div className="min-h-screen bg-page text-body flex flex-col font-sans">
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="AStrategy" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-base font-medium tracking-tight bg-gradient-to-r from-brand to-violet bg-clip-text text-transparent">
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
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand to-violet" />

          <div className="relative mb-6 mt-2">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full border border-border object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border border-border bg-brand-subtle flex items-center justify-center text-brand-light shadow-lg">
                <User size={40} />
              </div>
            )}
          </div>

          <div className="text-center w-full space-y-1 mb-8">
            <h2 className="text-xl font-medium text-body tracking-tight truncate px-2">
              {fullName}
            </h2>
            <p className="text-xs text-muted font-normal tracking-wide">
              @{nickname}
            </p>
            <p className="text-[10px] text-muted/60 mt-3 break-all border-t border-border/40 pt-3">
              {user.email}
            </p>
          </div>

          <Link
            href="/dashboard/explore"
            className="w-full flex items-center justify-center gap-2 bg-brand text-page font-medium text-sm py-3 px-6 rounded-xl hover:bg-brand-light active:scale-[0.98] transition-all shadow-md hover:shadow-brand/20 cursor-pointer text-center border border-brand-light/20"
          >
            <Search size={16} />
            Search Groups
          </Link>
        </div>
      </main>
    </div>
  )
}
