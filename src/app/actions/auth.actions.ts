"use server"

import { signInSchema, signUpSchema } from "@backend/core/entities/auth.schema"
import { GetSessionUseCase } from "@backend/core/use-cases/get-session.use-case"
import { SignInUseCase } from "@backend/core/use-cases/sign-in.use-case"
import { SignOutUseCase } from "@backend/core/use-cases/sign-out.use-case"
import { SignUpUseCase } from "@backend/core/use-cases/sign-up.use-case"
import { SupabaseAuthRepository } from "@backend/infra/repositories/supabase-auth.repository"
import { createClient } from "@backend/infra/supabase/server"
import type { Database } from "@backend/infra/supabase/types"
import type { ActionResponse } from "@shared/action-response"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function getAuthRepository() {
  const supabase = await createClient<Database>()
  return new SupabaseAuthRepository(supabase)
}

export async function getSessionAction() {
  if (isSupabasePlaceholder()) {
    return null
  }

  try {
    const repository = await getAuthRepository()
    const useCase = new GetSessionUseCase(repository)
    return await useCase.execute()
  } catch {
    return null
  }
}

export async function signUpAction(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const rawFullName = formData.get("fullName")
  const fullNameValue =
    typeof rawFullName === "string" && rawFullName.trim().length > 0
      ? rawFullName.trim()
      : undefined

  const validation = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: fullNameValue,
  })

  if (!validation.success) {
    return {
      success: false,
      message: "Dados de formulário inválidos.",
      errors: validation.error.flatten().fieldErrors,
    }
  }

  if (isSupabasePlaceholder()) {
    return {
      success: false,
      message:
        "Copie .env.example para .env.local e rode `npm run db:start` para criar contas no Supabase local.",
    }
  }

  try {
    const repository = await getAuthRepository()
    const useCase = new SignUpUseCase(repository)
    const result = await useCase.execute(validation.data)

    revalidatePath("/", "layout")

    if (result.needsEmailConfirmation) {
      return {
        success: true,
        message:
          "Conta criada! Verifique seu e-mail e clique no link de confirmação antes de entrar.",
        data: result.user,
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível criar a conta."
    return { success: false, message }
  }

  redirect("/")
}

export async function signInAction(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const validation = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validation.success) {
    return {
      success: false,
      message: "Dados de formulário inválidos.",
      errors: validation.error.flatten().fieldErrors,
    }
  }

  if (isSupabasePlaceholder()) {
    return {
      success: false,
      message:
        "Copie .env.example para .env.local e rode `npm run db:start` para entrar no Supabase local.",
    }
  }

  try {
    const repository = await getAuthRepository()
    const useCase = new SignInUseCase(repository)
    await useCase.execute(validation.data)

    revalidatePath("/", "layout")
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível entrar."
    return { success: false, message }
  }

  redirect("/")
}

export async function signOutAction(): Promise<void> {
  if (!isSupabasePlaceholder()) {
    try {
      const repository = await getAuthRepository()
      const useCase = new SignOutUseCase(repository)
      await useCase.execute()
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error)
    }
  }

  revalidatePath("/", "layout")
  redirect("/auth/login")
}
