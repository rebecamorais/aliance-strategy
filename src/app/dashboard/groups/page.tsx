import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { Users, Search, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function MyGroupsPage() {
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

  const repository = new SupabaseGroupRepository(supabase)
  const myGroups = await repository.listMyGroups(user.id)

  // Segregate groups
  const ownedGroups = myGroups.filter((g) => g.role === "CREATOR")
  const joinedGroups = myGroups.filter((g) => g.role === "MEMBER" || g.role === "OFFICIAL")
  const pendingGroups = myGroups.filter((g) => g.has_pending_application && !g.is_member)

  const hasGroups = ownedGroups.length > 0 || joinedGroups.length > 0 || pendingGroups.length > 0

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

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 space-y-12">
        <div>
          <h2 className="text-2xl font-medium text-body tracking-tight">My Groups</h2>
          <p className="text-xs text-muted mt-1">
            Manage the intelligence hubs you own, belong to, or have applied to join.
          </p>
        </div>

        {!hasGroups ? (
          <div className="text-center py-16 bg-surface border border-border border-dashed rounded-2xl max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-brand-subtle text-brand-light flex items-center justify-center mx-auto shadow-md">
              <Search size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-medium text-body">No Groups Found</h3>
              <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
                You do not own or belong to any groups yet. Explore available groups to request access.
              </p>
            </div>
            <Link
              href="/dashboard/explore"
              className="inline-flex items-center gap-2 bg-brand text-page font-medium text-xs py-3 px-6 rounded-xl hover:bg-brand-light active:scale-[0.98] transition-all shadow-md cursor-pointer border border-brand-light/20"
            >
              Search Groups
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Owned Groups */}
            {ownedGroups.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
                  Owned Groups ({ownedGroups.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-surface border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-brand" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-body truncate">{group.name}</h4>
                          <span className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border border-brand-light/20 bg-brand-subtle text-brand-light">
                            Creator
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/30 pt-3">
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Users size={12} />
                          {group.member_count} members
                        </span>
                        <Link
                          href={`/dashboard/groups/${group.id}`}
                          className="flex items-center gap-1.5 text-[10px] font-medium text-brand-light hover:text-brand transition-colors cursor-pointer"
                        >
                          View Board
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Joined Groups */}
            {joinedGroups.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
                  Joined Groups ({joinedGroups.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-surface border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-violet" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-body truncate">{group.name}</h4>
                          <span className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border border-border bg-page text-muted">
                            {group.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/30 pt-3">
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Users size={12} />
                          {group.member_count} members
                        </span>
                        <Link
                          href={`/dashboard/groups/${group.id}`}
                          className="flex items-center gap-1.5 text-[10px] font-medium text-brand-light hover:text-brand transition-colors cursor-pointer"
                        >
                          View Board
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Applications */}
            {pendingGroups.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
                  Pending Applications ({pendingGroups.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-surface border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4 relative overflow-hidden opacity-80"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-medium text-body truncate">{group.name}</h4>
                          <span className="flex items-center gap-1 text-[9px] font-medium text-warning bg-warning/10 border border-warning/20 px-2 py-0.5 rounded-lg">
                            <Clock size={10} />
                            Pending Review
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {group.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/30 pt-3">
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Users size={12} />
                          {group.member_count} members
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
