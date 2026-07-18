import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { ExploreGroupsContent } from "./explore-content"

import type { GroupWithMemberCount } from "@backend/core/entities/group.schema"

export const dynamic = "force-dynamic"

export default async function ExplorePage() {
  let groups: GroupWithMemberCount[] = []

  if (!isSupabasePlaceholder()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const repository = new SupabaseGroupRepository(supabase)
        groups = await repository.listAll(user.id)
      }
    } catch (err) {
      console.error("Failed to load initial groups list:", err)
    }
  }

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

      <ExploreGroupsContent initialGroups={groups} />
    </div>
  )
}
