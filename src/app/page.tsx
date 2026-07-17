import { listNoticesAction } from "./actions/notice.actions"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { NoticeBoard } from "@/frontend/components/notice-board"

export const dynamic = "force-dynamic"

export default async function Home() {
  // Carrega os dados diretamente no lado do servidor (Server Component)
  const notices = await listNoticesAction()

  return (
    <div className="min-h-screen bg-page text-body flex flex-col">
      {/* Header Premium do Template */}
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-violet flex items-center justify-center text-white font-medium text-lg shadow-md shadow-brand/20">
              F
            </div>
            <div>
              <h1 className="text-base font-medium tracking-tight bg-gradient-to-r from-brand to-violet bg-clip-text text-transparent">
                Fullstack Base Template
              </h1>
              <p className="text-[10px] text-muted font-medium tracking-wider uppercase">
                Clean Architecture & DDD-Lite
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AuthHeader />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-4 flex flex-wrap gap-2">
            <span className="text-[10px] font-medium bg-brand-subtle text-brand-dark border border-brand-lighter px-2.5 py-0.5 rounded-md">
              Next.js 15
            </span>
            <span className="text-[10px] font-medium bg-brand-subtle text-brand-dark border border-brand-lighter px-2.5 py-0.5 rounded-md">
              Tailwind v4
            </span>
            <span className="text-[10px] font-medium bg-brand-subtle text-brand-dark border border-brand-lighter px-2.5 py-0.5 rounded-md">
              Supabase SSR
            </span>
            <span className="text-[10px] font-medium bg-brand-subtle text-brand-dark border border-brand-lighter px-2.5 py-0.5 rounded-md">
              TypeScript Strict
            </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto py-8">
        {/* Banner de Boas-Vindas */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-r from-brand-darker to-brand-dark text-white rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden group">
            {/* Elemento Decorativo */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-brand-light/20 to-transparent pointer-events-none" />
            
            <h2 className="text-xl md:text-2xl font-medium tracking-tight mb-2">
              Bem-vindo ao Boilerplate Base
            </h2>
            <p className="text-brand-lighter text-xs md:text-sm max-w-2xl leading-relaxed">
              Este template foi estruturado com total desacoplamento entre frontend e backend. 
              As regras de negócio residem no Core (Pure TS), a infraestrutura está isolada no Backend 
              e a interface é mobile-first baseada na paleta de cores Rebeca Purple.
            </p>
          </div>
        </div>

        {/* Componente PoC do Mural de Avisos */}
        <NoticeBoard initialNotices={notices} />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-surface/50 py-6 mt-12 text-center text-xs text-muted">
        <div className="max-w-5xl mx-auto px-4">
          <p>
            Fullstack Base Template © {new Date().getFullYear()} — Staff Engineering Boilerplate.
          </p>
        </div>
      </footer>
    </div>
  )
}
