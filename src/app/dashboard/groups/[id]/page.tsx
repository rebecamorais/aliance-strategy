import { createClient } from "@/utils/supabase/server"
import { SupabaseGroupRepository } from "@backend/infra/repositories/supabase-group.repository"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { AuthHeader } from "@/frontend/components/auth/auth-header"
import { GroupNoticeFeed } from "./group-feed"
import { GroupManagement } from "./group-management"
import { GroupActions } from "./group-actions"
import { Shield, ShieldAlert, ArrowLeft, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function GroupDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (isSupabasePlaceholder()) {
    return redirect("/dashboard/explore")
  }

  const { id: groupId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/")
  }

  const repository = new SupabaseGroupRepository(supabase)
  const isMember = await repository.isMember(user.id, groupId)

  if (!isMember) {
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

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto border border-error/20">
              <ShieldAlert size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-body tracking-tight">Access Denied</h2>
              <p className="text-xs text-muted leading-relaxed">
                You must be an active member of this group to view its timeline feed and announcement board.
              </p>
            </div>
            <Link
              href="/dashboard/explore"
              className="w-full flex items-center justify-center gap-2 bg-brand text-page font-medium text-xs py-3 px-6 rounded-xl hover:bg-brand-light active:scale-[0.98] transition-all shadow-md cursor-pointer border border-brand-light/20"
            >
              <ArrowLeft size={14} />
              Return to Explore
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const groupDetails = await repository.getGroupDetails(groupId)
  if (!groupDetails) {
    return redirect("/dashboard/explore")
  }

  const userRole = await repository.getUserRole(user.id, groupId)
  const isOfficer = userRole === "CREATOR" || userRole === "OFFICIAL"
  const notices = await repository.listNotices(groupId)
  const members = await repository.listGroupMembers(groupId)
  const applications = await repository.listGroupApplications(groupId)
  const logs = await repository.listGroupLogs(groupId)

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

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
        {/* Left Side: Notice Feed */}
        <div className="flex-1 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand to-violet" />
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-medium text-body tracking-tight leading-none mb-2">
                  {groupDetails.name}
                </h1>
                <p className="text-xs text-muted leading-relaxed max-w-2xl">
                  {groupDetails.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-brand-light bg-brand-subtle border border-brand-light/20 px-3 py-1.5 rounded-lg">
                <Shield size={12} />
                <span>{userRole}</span>
              </div>
            </div>
          </div>

          <GroupNoticeFeed groupId={groupId} initialNotices={notices} isOfficer={isOfficer} />
        </div>

        {/* Right Side: Group Info Sidebar & Management */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
              Group Intelligence
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <Users size={14} className="text-brand-light" />
                <span>{members.length} members joined</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <Calendar size={14} className="text-brand-light" />
                <span>Created {new Date(groupDetails.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Link
              href="/dashboard/explore"
              className="w-full flex items-center justify-center gap-2 bg-brand-subtle border border-brand/20 text-brand-light font-medium text-xs py-2.5 rounded-lg hover:bg-brand-lighter/30 hover:border-brand-light/30 active:scale-[0.98] transition-all cursor-pointer mt-4"
            >
              <ArrowLeft size={12} />
              Back to Explore
            </Link>
            <div className="border-t border-border/30 pt-4">
              <GroupActions groupId={groupId} isCreator={userRole === "CREATOR"} />
            </div>
          </div>

          <GroupManagement
            groupId={groupId}
            currentUserId={user.id}
            currentUserRole={userRole || "MEMBER"}
            members={members}
            applications={applications}
            logs={logs}
          />
        </div>
      </main>
    </div>
  )
}
