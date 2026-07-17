"use client"

import { useActionState } from "react"
import { createGroupAction } from "@/app/actions/group.actions"
import type { ActionResponse } from "@shared/action-response"
import { useRouter } from "next/navigation"
import Link from "next/link"

const initialState: ActionResponse = {
  success: false,
  message: "",
}

export function NewGroupForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionResponse, formData: FormData) => {
      const response = await createGroupAction(prevState, formData)
      if (response.success) {
        router.push("/dashboard/explore")
      }
      return response
    },
    initialState
  )

  return (
    <main className="flex-1 max-w-lg w-full mx-auto py-12 px-4 font-sans text-body">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-body tracking-tight">Create Group</h1>
          <p className="text-xs text-muted mt-1">Form a new group to coordinate strategy</p>
        </div>
        <Link
          href="/dashboard/explore"
          className="text-xs font-medium text-indigo hover:text-brand-light transition-colors"
        >
          ← Back to Explore
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-xl">
        <form action={formAction} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-muted mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Alpha Squad"
              className={`w-full bg-page border rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all ${
                state.errors?.name ? "border-error" : "border-border"
              }`}
            />
            {state.errors?.name && (
              <p className="text-xs text-error mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-muted mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the group's objective and rules..."
              className={`w-full bg-page border rounded-lg px-3 py-2 text-sm text-body placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all ${
                state.errors?.description ? "border-error" : "border-border"
              }`}
            />
            {state.errors?.description && (
              <p className="text-xs text-error mt-1">{state.errors.description[0]}</p>
            )}
          </div>

          {state.message && !state.success && (
            <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand text-page font-medium text-sm py-2.5 rounded-lg hover:bg-brand-light active:bg-brand-dark transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
          >
            {isPending ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </main>
  )
}
