import { listNoticesAction } from "@/app/actions/notice.actions"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { NoticeBoard } from "@/frontend/components/notice-board"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const notices = await listNoticesAction()

  return (
    <div className="min-h-screen bg-page text-body flex flex-col font-sans">
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-violet flex items-center justify-center text-page font-medium text-lg shadow-md shadow-brand/20">
              AS
            </div>
            <div>
              <h1 className="text-base font-medium tracking-tight bg-gradient-to-r from-brand to-violet bg-clip-text text-transparent">
                Alliance Strategy
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

      <main className="flex-1 max-w-5xl w-full mx-auto py-8">
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-brand-darker to-brand-dark text-body rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-brand-light/20 to-transparent pointer-events-none" />
            <h2 className="text-xl md:text-2xl font-medium tracking-tight mb-2 text-body">
              Welcome to Alliance Strategy
            </h2>
            <p className="text-brand-light text-xs md:text-sm max-w-2xl leading-relaxed">
              Authentication via Discord was successful. You are in the protected area and now have full access to the intelligence center.
            </p>
          </div>
        </div>

        <NoticeBoard initialNotices={notices} />
      </main>

      <footer className="w-full border-t border-border bg-surface/50 py-6 mt-12 text-center text-xs text-muted">
        <div className="max-w-5xl mx-auto px-4">
          <p>
            Alliance Strategy © {new Date().getFullYear()} — Staff Engineering.
          </p>
        </div>
      </footer>
    </div>
  )
}
