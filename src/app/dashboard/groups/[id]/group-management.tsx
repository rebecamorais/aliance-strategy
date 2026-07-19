"use client"

import { useState, useTransition } from "react"
import { Check, X, UserX } from "lucide-react"
import { useRouter } from "next/navigation"

interface Member {
  profile_id: string
  role: string
  joined_at: string
  main_account: string
  nickname: string | null
  full_name: string | null
  avatar_url?: string | null
  login_method?: string | null
  email?: string | null
}

interface Application {
  id: string
  profile_id: string
  created_at: string
  main_account: string
  nickname: string | null
  full_name: string | null
  avatar_url?: string | null
  login_method?: string | null
  email?: string | null
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
  const [selectedProfile, setSelectedProfile] = useState<Member | Application | null>(null)
  const router = useRouter()

  const maskEmail = (email: string | null | undefined): string => {
    if (!email) return "Not provided"
    const parts = email.split("@")
    if (parts.length !== 2) return email
    const [local, domain] = parts
    const maskedLocal = local.length > 2 
      ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
      : local[0] + "*"
    return `${maskedLocal}@${domain}`
  }

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

  const handleUpdateRole = async (targetProfileId: string, newRole: "OFFICIAL" | "MEMBER") => {
    const actionText = newRole === "OFFICIAL" ? "promote" : "demote"
    if (!confirm(`Are you sure you want to ${actionText} this member?`)) return

    setErrorMsg("")
    setSuccessMsg("")

    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/members/${targetProfileId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setSuccessMsg(data.message || `Member successfully ${actionText}d.`)
          await refreshGroupData()
        } else {
          setErrorMsg(data.message || `Failed to ${actionText} member.`)
        }
      } catch {
        setErrorMsg(`An error occurred while trying to ${actionText} member.`)
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
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setSelectedProfile(app)}
                    className="w-8 h-8 rounded-full overflow-hidden bg-brand-subtle flex items-center justify-center border border-border/50 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    {app.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={app.avatar_url} alt={app.main_account} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-brand-light">
                        {app.main_account.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-body flex items-center gap-2">
                      {app.nickname || `@${app.main_account}`}
                    </p>
                    {app.login_method && (
                      <p className="text-[9px] text-muted flex items-center gap-1 mt-0.5">
                        <span>Method:</span>
                        <span className="font-medium uppercase text-brand-light/95">{app.login_method}</span>
                      </p>
                    )}
                  </div>
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
            const allowedToPromoteDemote = currentUserRole === "CREATOR" && m.profile_id !== currentUserId
            return (
              <div key={m.profile_id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setSelectedProfile(m)}
                    className="w-8 h-8 rounded-full overflow-hidden bg-brand-subtle flex items-center justify-center border border-border/50 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt={m.main_account} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-brand-light">
                        {m.main_account.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-body">
                        {m.nickname || `@${m.main_account}`}
                      </span>
                      <span className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 rounded border border-border bg-page text-muted">
                        {m.role}
                      </span>
                    </div>
                    {isOfficer && m.login_method && (
                      <p className="text-[9px] text-muted flex items-center gap-1 mt-0.5">
                        <span>Method:</span>
                        <span className="font-medium uppercase text-brand-light/95">{m.login_method}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {allowedToPromoteDemote && (
                    <button
                      onClick={() => handleUpdateRole(m.profile_id, m.role === "MEMBER" ? "OFFICIAL" : "MEMBER")}
                      disabled={isPending}
                      className="flex items-center gap-1 text-[10px] font-medium border border-brand/20 bg-brand/10 text-brand-light px-2.5 py-1.5 rounded-lg hover:bg-brand/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {m.role === "MEMBER" ? "Promote" : "Demote"}
                    </button>
                  )}
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
      {/* Profile Modal Pop-up */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-surface border border-border rounded-xl p-6 shadow-2xl space-y-6 text-left">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg border border-border hover:bg-surface2 text-muted hover:text-body transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-subtle border-2 border-brand/50 flex items-center justify-center shadow-lg">
                {selectedProfile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedProfile.avatar_url} alt={selectedProfile.main_account} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-medium text-brand-light">
                    {selectedProfile.main_account.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-medium text-body tracking-tight">
                  {selectedProfile.nickname || "No Nickname"}
                </h3>
                {selectedProfile.nickname && (
                  <p className="text-xs text-muted mt-0.5">@{selectedProfile.main_account}</p>
                )}
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Full Name</span>
                <span className="text-body font-medium">{selectedProfile.full_name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Account/ID</span>
                <span className="text-body font-medium">@{selectedProfile.main_account}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Email</span>
                <span className="text-body font-medium">{maskEmail(selectedProfile.email)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Login Method</span>
                <span className="text-accent-light font-medium uppercase tracking-wide">
                  {selectedProfile.login_method || "Email"}
                </span>
              </div>
              {"role" in selectedProfile && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Role</span>
                  <span className="px-2 py-0.5 rounded border border-border bg-page text-xs font-medium text-muted uppercase">
                    {selectedProfile.role}
                  </span>
                </div>
              )}
              {"joined_at" in selectedProfile && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Member Since</span>
                  <span className="text-body font-medium">
                    {new Date(selectedProfile.joined_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {"created_at" in selectedProfile && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Applied On</span>
                  <span className="text-body font-medium">
                    {new Date(selectedProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedProfile(null)}
                className="bg-brand text-page text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-light active:bg-brand-dark transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
