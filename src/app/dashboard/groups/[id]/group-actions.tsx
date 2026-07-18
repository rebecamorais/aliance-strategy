"use client"

import { useState, useTransition } from "react"
import { Trash2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  groupId: string
  isCreator: boolean
}

export function GroupActions({ groupId, isCreator }: Props) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState("")
  const router = useRouter()

  const handleDeleteGroup = async () => {
    if (
      !confirm(
        "WARNING: Are you absolutely sure you want to delete this group? All notices, logs, and membership details will be permanently erased."
      )
    ) {
      return
    }

    setErrorMsg("")
    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}`, {
          method: "DELETE",
        })

        const data = await res.json()

        if (res.ok && data.success) {
          router.push("/dashboard/explore")
          router.refresh()
        } else {
          setErrorMsg(data.message || "Failed to delete group.")
        }
      } catch {
        setErrorMsg("An unexpected error occurred.")
      }
    })
  }

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to voluntarily leave this group?")) {
      return
    }

    setErrorMsg("")
    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/leave`, {
          method: "POST",
        })

        const data = await res.json()

        if (res.ok && data.success) {
          router.push("/dashboard/explore")
          router.refresh()
        } else {
          setErrorMsg(data.message || "Failed to leave group.")
        }
      } catch {
        setErrorMsg("An unexpected error occurred.")
      }
    })
  }

  return (
    <div className="w-full space-y-2">
      {errorMsg && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-xs text-error font-medium">
          {errorMsg}
        </div>
      )}

      {isCreator ? (
        <button
          onClick={handleDeleteGroup}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 border border-error/20 bg-error/10 text-error font-medium text-xs py-2.5 rounded-lg hover:bg-error/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <Trash2 size={12} />
          {isPending ? "Deleting..." : "Delete Group"}
        </button>
      ) : (
        <button
          onClick={handleLeaveGroup}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 border border-error/20 bg-error/10 text-error font-medium text-xs py-2.5 rounded-lg hover:bg-error/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <LogOut size={12} />
          {isPending ? "Leaving..." : "Leave Group"}
        </button>
      )}
    </div>
  )
}
