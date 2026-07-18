"use client"

import { useState, useTransition } from "react"
import { User, Search, Save } from "lucide-react"
import Link from "next/link"

interface Props {
  initialNickname: string
  fullName: string
  mainAccount: string
  avatarUrl: string | null
}

export function ProfileForm({
  initialNickname,
  fullName,
  mainAccount,
  avatarUrl,
}: Props) {
  const [nickname, setNickname] = useState(initialNickname)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    startTransition(async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname }),
        })

        const data = await res.json()

        if (res.ok && data.success) {
          setSuccessMsg(data.message || "Nickname updated successfully!")
        } else {
          setErrorMsg(data.message || "Failed to update nickname.")
        }
      } catch {
        setErrorMsg("An unexpected error occurred.")
      }
    })
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand to-violet" />

      <div className="relative mb-6 mt-2">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={fullName}
            className="w-24 h-24 rounded-full border border-border object-cover shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border border-border bg-brand-subtle flex items-center justify-center text-brand-light shadow-lg">
            <User size={40} />
          </div>
        )}
      </div>

      <div className="text-center w-full space-y-1 mb-6">
        <h2 className="text-xl font-medium text-body tracking-tight truncate px-2">
          {fullName}
        </h2>
        <p className="text-xs text-muted font-normal tracking-wide">
          @{mainAccount}
        </p>
      </div>

      <form onSubmit={handleSave} className="w-full space-y-4 border-t border-border/40 pt-5 mb-6">
        <div className="space-y-1.5">
          <label htmlFor="nickname" className="text-[10px] text-muted font-medium tracking-wider uppercase">
            Custom Nickname
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Choose a display nickname..."
            maxLength={30}
            className="w-full bg-page border border-border rounded-xl px-3.5 py-2.5 text-xs text-body placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded-lg text-[10px] text-error font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-success/10 border border-success/20 rounded-lg text-[10px] text-success font-medium">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 border border-brand/20 bg-brand-subtle text-brand-light font-medium text-xs py-2.5 rounded-xl hover:bg-brand-lighter/20 hover:border-brand-light/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <Save size={14} />
          {isPending ? "Saving..." : "Save Nickname"}
        </button>
      </form>

      <Link
        href="/dashboard/explore"
        className="w-full flex items-center justify-center gap-2 bg-brand text-page font-medium text-xs py-3 px-6 rounded-xl hover:bg-brand-light active:scale-[0.98] transition-all shadow-md hover:shadow-brand/20 cursor-pointer text-center border border-brand-light/20"
      >
        <Search size={14} />
        Search Groups
      </Link>
    </div>
  )
}
