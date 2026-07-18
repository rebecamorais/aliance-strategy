import { getSessionAction, signOutAction } from "@/app/actions/auth.actions"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import Link from "next/link"

export async function AuthHeader() {
  const session = await getSessionAction()
  const demoMode = isSupabasePlaceholder()

  return (
    <div className="flex flex-wrap items-center gap-3">
      {demoMode ? (
        <span className="text-[10px] font-medium rounded-md border border-warning/40 bg-warning/10 text-warning px-2.5 py-0.5">
          Local Supabase Offline
        </span>
      ) : null}

      {session ? (
        <>
          <Link
            href="/dashboard/profile"
            className="text-xs font-medium rounded-lg border border-border px-3 py-1.5 text-body hover:bg-brand-subtle hover:border-brand-light/30 transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/groups"
            className="text-xs font-medium rounded-lg border border-border px-3 py-1.5 text-body hover:bg-brand-subtle hover:border-brand-light/30 transition-colors"
          >
            My Groups
          </Link>
          <Link
            href="/dashboard/explore"
            className="text-xs font-medium rounded-lg border border-border px-3 py-1.5 text-body hover:bg-brand-subtle hover:border-brand-light/30 transition-colors"
          >
            Search Groups
          </Link>
          <span className="text-xs font-normal text-muted hidden md:inline ml-2">
            {session.email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium rounded-lg bg-brand px-3 py-1.5 text-page hover:bg-brand-light active:bg-brand-dark transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/"
          className="text-xs font-medium rounded-lg bg-brand px-4 py-1.5 text-page hover:bg-brand-light active:bg-brand-dark transition-colors"
        >
          Sign in
        </Link>
      )}
    </div>
  )
}
