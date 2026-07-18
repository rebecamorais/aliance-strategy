"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

function LoginContent() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const handleLogin = (provider: "discord" | "google") => {
    setIsLoading(provider)
    window.location.href = `/api/auth/${provider}`
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page p-4 font-sans text-body">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 border border-border text-center shadow-2xl">
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="AStrategy" className="mx-auto mb-4 h-12 w-12 object-contain" />
          <h1 className="text-2xl font-medium text-body tracking-tight">AStrategy</h1>
          <p className="text-sm text-muted mt-1">Choose an authentication method.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error text-left">
            {error === "no_url" || error === "init_failed" ? "Failed to initiate login. Please verify configuration." : `Authentication error: ${decodeURIComponent(error)}`}
          </div>
        )}

        <div className="space-y-3">
          {/* Botão do Discord */}
          <button
            onClick={() => handleLogin("discord")}
            disabled={isLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4752C4] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a74.37,74.37,0,0,0,6.72-11A68.6,68.6,0,0,1,28,80.17c.94-.69,1.84-1.42,2.71-2.17a74.52,74.52,0,0,0,65.69,0c.87.75,1.77,1.48,2.71,2.17a68.75,68.75,0,0,1-10.66,5.18,75.14,75.14,0,0,0,6.72,11,105.73,0,0,0,31-18.83C129,54.65,122.64,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            {isLoading === "discord" ? "Connecting..." : "Sign in with Discord"}
          </button>

          {/* Botão do Google */}
          <button
            onClick={() => handleLogin("google")}
            disabled={isLoading !== null}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.72z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.24A7.16 7.16 0 0 1 4.91 12c0-.79.13-1.57.38-2.31V6.54H1.21A11.977 11.977 0 0 0 0 12c0 1.92.45 3.74 1.21 5.46l4.11-3.22z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 6.54l4.11 3.22c.94-2.85 3.57-4.96 6.68-4.96z"/>
            </svg>
            {isLoading === "google" ? "Connecting..." : "Sign in with Google"}
          </button>
        </div>
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
