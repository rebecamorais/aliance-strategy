"use client"

import { useState, useTransition } from "react"
import { Search, Users, Check, Clock, Plus } from "lucide-react"
import { applyToGroupAction } from "@/app/actions/group.actions"
import type { GroupWithMemberCount } from "@backend/core/entities/group.schema"
import Link from "next/link"

interface Props {
  initialGroups: GroupWithMemberCount[]
}

export function ExploreGroupsContent({ initialGroups }: Props) {
  const [groups, setGroups] = useState<GroupWithMemberCount[]>(initialGroups)
  const [searchQuery, setSearchQuery] = useState("")
  const [, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [applyingGroupId, setApplyingGroupId] = useState<string | null>(null)

  const handleApply = async (groupId: string) => {
    setErrorMsg("")
    setSuccessMsg("")
    setApplyingGroupId(groupId)

    startTransition(async () => {
      try {
        const res = await applyToGroupAction(groupId)
        if (res.success) {
          setSuccessMsg(res.message || "Application sent successfully!")
          setGroups((prev) =>
            prev.map((g) =>
              g.id === groupId
                ? { ...g, has_pending_application: true }
                : g
            )
          )
        } else {
          setErrorMsg(res.message || "Failed to submit application.")
        }
      } catch {
        setErrorMsg("An unexpected error occurred.")
      } finally {
        setApplyingGroupId(null)
      }
    })
  }

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 font-sans text-body">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-medium text-body tracking-tight">Explore Groups</h1>
          <p className="text-xs text-muted mt-1">Discover public squads or start your own alliance</p>
        </div>
        <Link
          href="/dashboard/groups/new"
          className="flex items-center justify-center gap-2 bg-brand text-page font-medium text-xs px-4 py-2.5 rounded-lg hover:bg-brand-light active:bg-brand-dark transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Create Group
        </Link>
      </div>

      {successMsg && (
        <div className="mb-6 rounded-lg border border-success/20 bg-success/10 p-3 text-xs text-success">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error">
          {errorMsg}
        </div>
      )}

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search groups by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all shadow-md"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-surface/30 border border-border border-dashed rounded-2xl">
          <p className="text-sm text-muted">No groups found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-surface border border-border rounded-xl p-6 shadow-xl flex flex-col justify-between h-48 transition-all hover:border-brand-lighter hover:shadow-brand/5"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-medium text-body leading-tight truncate max-w-[200px] sm:max-w-[250px]">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted bg-brand-subtle border border-brand-lighter px-2.5 py-1 rounded-full">
                    <Users size={12} className="text-brand-light" />
                    <span>{group.member_count}</span>
                  </div>
                </div>
                <p className="text-xs text-muted line-clamp-3 leading-relaxed mb-4">
                  {group.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 mt-auto">
                <div className="text-[10px] text-muted">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </div>

                {group.is_member ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-lg">
                    <Check size={12} />
                    Member
                  </span>
                ) : group.has_pending_application ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-lg">
                    <Clock size={12} />
                    Pending
                  </span>
                ) : (
                  <button
                    onClick={() => handleApply(group.id)}
                    disabled={applyingGroupId !== null}
                    className="bg-brand-subtle border border-brand/20 text-brand-light font-medium text-xs px-4 py-1.5 rounded-lg hover:bg-brand-lighter/30 hover:border-brand-light/30 active:bg-brand-dark/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {applyingGroupId === group.id ? "Applying..." : "Apply"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
