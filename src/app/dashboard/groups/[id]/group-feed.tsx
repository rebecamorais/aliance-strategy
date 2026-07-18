"use client"

import { useState, useTransition } from "react"
import { Send, Calendar, User } from "lucide-react"
import type { GroupNotice } from "@backend/core/entities/group-notice.schema"

interface Props {
  groupId: string
  initialNotices: GroupNotice[]
  isOfficer: boolean
}

export function GroupNoticeFeed({ groupId, initialNotices, isOfficer }: Props) {
  const [notices, setNotices] = useState<GroupNotice[]>(initialNotices)
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setErrorMsg("")
    setSuccessMsg("")

    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/notices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setContent("")
          setSuccessMsg(data.message || "Posted successfully!")
          const fetchRes = await fetch(`/api/groups/${groupId}/notices`)
          if (fetchRes.ok) {
            const updated = await fetchRes.json()
            setNotices(updated)
          }
        } else {
          setErrorMsg(data.message || "Failed to post notice.")
        }
      } catch {
        setErrorMsg("An unexpected error occurred.")
      }
    })
  }

  return (
    <div className="space-y-8">
      {isOfficer && (
        <div className="bg-surface border border-border rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-medium text-body mb-3">Post Announcement</h3>
          <form onSubmit={handlePostNotice} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post a new text announcement to the group feed..."
              rows={3}
              className="w-full bg-page border border-border rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all"
            />
            {errorMsg && <p className="text-xs text-error">{errorMsg}</p>}
            {successMsg && <p className="text-xs text-success">{successMsg}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="flex items-center gap-2 bg-brand text-page font-medium text-xs px-4 py-2 rounded-lg hover:bg-brand-light active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send size={12} />
                {isPending ? "Posting..." : "Post Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-base font-medium text-body tracking-tight">Timeline Feed</h3>

        {notices.length === 0 ? (
          <div className="text-center py-12 bg-surface/30 border border-border border-dashed rounded-xl">
            <p className="text-sm text-muted">No announcements have been posted in this group yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-surface border border-border rounded-xl p-5 shadow-md flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-4 border-b border-border/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-subtle flex items-center justify-center text-brand-light">
                      <User size={12} />
                    </div>
                    <span className="text-xs font-medium text-body truncate max-w-[150px] sm:max-w-[250px]">
                      {notice.profile.nickname || notice.profile.full_name || `@${notice.profile.main_account}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <Calendar size={10} />
                    <span>{new Date(notice.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
