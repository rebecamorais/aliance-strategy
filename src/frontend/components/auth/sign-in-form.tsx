"use client"

import { signInAction } from "@/app/actions/auth.actions"
import type { ActionResponse } from "@shared/action-response"
import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/frontend/components/ui/button"

const initialState: ActionResponse = { success: false, message: "" }

export function SignInForm({ callbackError }: { callbackError?: boolean }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {callbackError ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          Não foi possível confirmar o login. Tente entrar novamente.
        </p>
      ) : null}

      {state.message && !state.success ? (
        <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-body">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
          className={`w-full rounded-lg border bg-page px-3.5 py-2 text-sm text-body transition-all focus:outline-none focus:ring-2 ${
            state.errors?.email
              ? "border-error focus:ring-error/20"
              : "border-border focus:border-brand-light focus:ring-brand-subtle"
          }`}
        />
        {state.errors?.email ? (
          <span className="text-error text-xs">{state.errors.email[0]}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-body">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={`w-full rounded-lg border bg-page px-3.5 py-2 text-sm text-body transition-all focus:outline-none focus:ring-2 ${
            state.errors?.password
              ? "border-error focus:ring-error/20"
              : "border-border focus:border-brand-light focus:ring-brand-subtle"
          }`}
        />
        {state.errors?.password ? (
          <span className="text-error text-xs">{state.errors.password[0]}</span>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand text-page hover:bg-brand-light active:bg-brand-dark"
      >
        {isPending ? "Entrando…" : "Entrar"}
      </Button>

      <p className="text-center text-sm font-normal text-muted">
        Ainda não tem conta?{" "}
        <Link href="/auth/register" className="text-brand hover:text-brand-light">
          Criar conta
        </Link>
      </p>
    </form>
  )
}
