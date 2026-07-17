import { getSessionAction, signOutAction } from "@/app/actions/auth.actions"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import Link from "next/link"

export async function AuthHeader() {
  const session = await getSessionAction()
  const demoMode = isSupabasePlaceholder()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {demoMode ? (
        <span className="text-[10px] font-medium rounded-md border border-warning/40 bg-warning/10 text-warning px-2.5 py-0.5">
          Supabase local inativo
        </span>
      ) : null}

      {session ? (
        <>
          <span className="text-xs font-normal text-muted hidden sm:inline">
            {session.email}
          </span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-xs font-medium rounded-lg border border-border px-3 py-1.5 text-body hover:bg-brand-subtle transition-colors"
            >
              Sair
            </button>
          </form>
        </>
      ) : (
        <>
          <Link
            href="/auth/login"
            className="text-xs font-medium rounded-lg border border-border px-3 py-1.5 text-body hover:bg-brand-subtle transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/auth/register"
            className="text-xs font-medium rounded-lg bg-brand px-3 py-1.5 text-page hover:bg-brand-light active:bg-brand-dark transition-colors"
          >
            Criar conta
          </Link>
        </>
      )}
    </div>
  )
}
