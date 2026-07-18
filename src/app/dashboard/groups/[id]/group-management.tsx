"use client"

import { useState, useTransition } from "react"
import { Check, X, UserX } from "lucide-react"
import { useRouter } from "next/navigation"

interface Member {
  profile_id: string
  role: string
  joined_at: string
  main_account: string
  email: string
}

interface Application {
  id: string
  profile_id: string
  created_at: string
  main_account: string
  email: string
}

interface Log {
  id: string
  action: "APPLIED" | "ACCEPTED" | "REJECTED" | "REMOVED" | "LEFT"
  targetName: string
  actorName: string | null
  createdAt: string
}

interface Props {
  groupId: string
  currentUserId: string
  currentUserRole: string
  members: Member[]
  applications: Application[]
  logs: Log[]
}

export function GroupManagement({
  groupId,
  currentUserId,
  currentUserRole,
  members,
  applications,
  logs,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const router = useRouter()

  const isOfficer = currentUserRole === "CREATOR" || currentUserRole === "OFFICIAL"

  const refreshGroupData = async () => {
    try {
      const res = await fetch(window.location.href)
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // Ignored
    }
  }

  const handleApplicationDecision = async (appId: string, accept: boolean) => {
    setErrorMsg("")
    setSuccessMsg("")

    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${appId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accept }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setSuccessMsg(data.message)
          await refreshGroupData()
        } else {
          setErrorMsg(data.message || "Failed to process application decision.")
        }
      } catch {
        setErrorMsg("An error occurred while deciding application.")
      }
    })
  }

  const handleRemoveMember = async (targetProfileId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    setErrorMsg("")
    setSuccessMsg("")

    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/members/${targetProfileId}`, {
          method: "DELETE",
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setSuccessMsg(data.message || "Member removed successfully.")
          await refreshGroupData()
        } else {
          setErrorMsg(data.message || "Failed to remove member.")
        }
      } catch {
        setErrorMsg("An error occurred while removing member.")
      }
    })
  }

  const canRemove = (targetRole: string, targetProfileId: string) => {
    if (targetProfileId === currentUserId) return false
    if (currentUserRole === "CREATOR") return true
    if (currentUserRole === "OFFICIAL") {
      return targetRole === "MEMBER"
    }
    return false
  }

  const formatLog = (log: Log) => {
    const timeStr =
      new Date(log.createdAt).toLocaleDateString() +
      " " +
      new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    switch (log.action) {
      case "APPLIED":
        return { text: `@${log.targetName} applied for membership.`, date: timeStr }
      case "ACCEPTED":
        return { text: `@${log.actorName} approved @${log.targetName}'s application.`, date: timeStr }
      case "REJECTED":
        return { text: `@${log.actorName} rejected @${log.targetName}'s application.`, date: timeStr }
      case "REMOVED":
        return { text: `@${log.actorName} removed @${log.targetName} from the group.`, date: timeStr }
      case "LEFT":
        return { text: `@${log.targetName} left the group.`, date: timeStr }
      default:
        return { text: "System audit log recorded.", date: timeStr }
    }
  }

  return (
    <div className="space-y-8">
      {(errorMsg || successMsg) && (
        <div className="space-y-2">
          {errorMsg && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-xs text-error font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-xs text-success font-medium">
              {successMsg}
            </div>
          )}
        </div>
      )}

      {isOfficer && applications.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
            Pending Applications ({applications.length})
          </h3>
          <div className="divide-y divide-border/30">
            {applications.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-xs font-medium text-body">@{app.main_account}</p>
                  <p className="text-[10px] text-muted">{app.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplicationDecision(app.id, true)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg border border-success/20 bg-success/10 text-success hover:bg-success/20 transition-all cursor-pointer disabled:opacity-50"
                    title="Approve"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleApplicationDecision(app.id, false)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg border border-error/20 bg-error/10 text-error hover:bg-error/20 transition-all cursor-pointer disabled:opacity-50"
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
          Active Members ({members.length})
        </h3>
        <div className="divide-y divide-border/30">
          {members.map((m) => {
            const allowedToKick = canRemove(m.role, m.profile_id)
            return (
              <div key={m.profile_id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-body">@{m.main_account}</span>
                    <span className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border border-border bg-page text-muted">
                      {m.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">{m.email}</p>
                </div>
                {allowedToKick && (
                  <button
                    onClick={() => handleRemoveMember(m.profile_id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-[10px] font-medium border border-error/20 bg-error/10 text-error px-2.5 py-1.5 rounded-lg hover:bg-error/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <UserX size={10} />
                    Kick
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-medium text-body border-b border-border/30 pb-2">
          Audit Timeline (Logs)
        </h3>
        {logs.length === 0 ? (
          <p className="text-xs text-muted text-center py-4">No audit logs recorded.</p>
        ) : (
          <div className="relative pl-4 border-l border-border/50 space-y-4">
            {logs.map((log) => {
              const formatted = formatLog(log)
              return (
                <div key={log.id} className="relative space-y-0.5">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-brand border border-page ring-4 ring-page" />
                  <p className="text-xs text-body leading-relaxed">{formatted.text}</p>
                  <p className="text-[10px] text-muted">{formatted.date}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
