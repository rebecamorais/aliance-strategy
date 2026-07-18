"use client"

import { signUpAction } from "@/app/actions/auth.actions"
import type { ActionResponse } from "@shared/action-response"
import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/frontend/components/ui/button"

const initialState: ActionResponse = { success: false, message: "" }

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.success
              ? "border-success/30 bg-success/10 text-success"
              : "border-error/30 bg-error/10 text-error"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className="text-sm font-medium text-body">
          Nome completo{" "}
          <span className="font-normal text-muted">(opcional)</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Maria Silva"
          className={`w-full rounded-lg border bg-page px-3.5 py-2 text-sm text-body transition-all focus:outline-none focus:ring-2 ${
            state.errors?.fullName
              ? "border-error focus:ring-error/20"
              : "border-border focus:border-brand-light focus:ring-brand-subtle"
          }`}
        />
        {state.errors?.fullName ? (
          <span className="text-error text-xs">{state.errors.fullName[0]}</span>
        ) : null}
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
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
        {isPending ? "Criando conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-sm font-normal text-muted">
        Já tem conta?{" "}
        <Link href="/auth/login" className="text-brand hover:text-brand-light">
          Entrar
        </Link>
      </p>
    </form>
  )
}
