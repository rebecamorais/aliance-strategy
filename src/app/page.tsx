"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const handleDiscordLogin = async () => {
    setIsLoading(true)
    window.location.href = "/api/auth/discord"
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page p-4 font-sans text-body">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 border border-border text-center shadow-2xl">
        <div className="mb-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-brand-subtle flex items-center justify-center border border-brand-lighter shadow-md shadow-brand/10">
            <span className="text-brand font-medium text-xl">AS</span>
          </div>
          <h1 className="text-2xl font-medium text-body tracking-tight">Alliance Strategy</h1>
          <p className="text-sm text-muted mt-1">Authenticate to access the intelligence center.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error text-left">
            {error === "init_failed" && "Failed to initiate Discord login. Please verify Supabase configuration."}
            {error === "auth_failed" && "Discord authentication failed. Please try again."}
            {error !== "init_failed" && error !== "auth_failed" && "An error occurred while attempting to sign in."}
          </div>
        )}

        <button
          onClick={handleDiscordLogin}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-3.5 font-medium text-white transition-all hover:bg-[#4752C4] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.72-11A68.6,68.6,0,0,1,28,80.17c.94-.69,1.84-1.42,2.71-2.17a74.52,74.52,0,0,0,65.69,0c.87.75,1.77,1.48,2.71,2.17a68.75,68.75,0,0,1-10.66,5.18,75.14,75.14,0,0,0,6.72,11,105.73,105.73,0,0,0,31-18.83C129,54.65,122.64,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
          </svg>
          {isLoading ? "Connecting..." : "Sign in with Discord"}
        </button>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-page p-4 font-sans text-body">
        <div className="w-full max-w-sm rounded-2xl bg-surface p-8 border border-border text-center shadow-2xl">
          <div className="animate-pulse">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-brand-subtle border border-brand-lighter" />
            <div className="h-6 bg-brand-subtle rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-brand-subtle rounded w-1/2 mx-auto mb-6" />
            <div className="h-12 bg-brand-subtle rounded w-full" />
          </div>
        </div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  )
}
