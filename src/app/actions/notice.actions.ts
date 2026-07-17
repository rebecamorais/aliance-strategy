"use server"

import { createNoticeSchema, Notice } from "@backend/core/entities/notice.schema"
import { CreateNoticeUseCase } from "@backend/core/use-cases/create-notice.use-case"
import { ListNoticesUseCase } from "@backend/core/use-cases/list-notices.use-case"
import { SupabaseNoticeRepository } from "@backend/infra/repositories/supabase-notice.repository"
import { createClient } from "@backend/infra/supabase/server"
import { Database } from "@backend/infra/supabase/types"
import type { ActionResponse } from "@shared/action-response"
import { isSupabasePlaceholder } from "@shared/supabase-config"
import { revalidatePath } from "next/cache"
import { GetSessionUseCase } from "@backend/core/use-cases/get-session.use-case"
import { SupabaseAuthRepository } from "@backend/infra/repositories/supabase-auth.repository"

function getMockNotices(): Notice[] {
  return [
    {
      id: "11111111-1111-1111-1111-111111111111",
      title: "📢 Bem-vindo ao Fullstack Template!",
      content: "Modo demo: o Supabase local não está acessível. Copie .env.example para .env.local e rode `npm run db:start` (requer Docker e Supabase CLI).",
      created_at: new Date().toISOString(),
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "🛠️ Como configurar o banco de dados?",
      content: "1. cp .env.example .env.local\n2. npm run db:start\n3. npm run db:reset (aplica migrations em supabase/migrations/)\n4. npm run dev\n5. Crie uma conta em /auth/register",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ]
}

export async function createNoticeAction(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const title = formData.get("title") as string
  const content = formData.get("content") as string

  // Validar com Zod (safeParse)
  const validation = createNoticeSchema.safeParse({ title, content })

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
      message: "Modo demo: rode `npm run db:start` e use o .env.local do .env.example para salvar avisos.",
    }
  }

  try {
    const supabase = await createClient<Database>()
    const authRepository = new SupabaseAuthRepository(supabase)
    const session = await new GetSessionUseCase(authRepository).execute()

    if (!session) {
      return {
        success: false,
        message: "Faça login para publicar avisos no mural.",
      }
    }

    const repository = new SupabaseNoticeRepository(supabase)
    const useCase = new CreateNoticeUseCase(repository)

    const notice = await useCase.execute(validation.data)

    revalidatePath("/")

    return {
      success: true,
      message: "Aviso criado com sucesso!",
      data: notice,
    }
  } catch (error) {
    console.error("Erro no createNoticeAction:")
    
    const errMessage = error instanceof Error ? error.message : ""
    const errorMessage = errMessage.includes("fetch failed")
      ? "Não foi possível conectar ao servidor do Supabase. Verifique sua conexão de internet ou chaves no .env.local."
      : errMessage || "Ocorreu um erro interno no servidor."

    return {
      success: false,
      message: errorMessage,
    }
  }
}

export async function listNoticesAction(): Promise<Notice[]> {
  // Retornar dados simulados se for placeholder para não quebrar a primeira inicialização do app
  if (isSupabasePlaceholder()) {
    return getMockNotices()
  }

  try {
    const supabase = await createClient<Database>()
    const repository = new SupabaseNoticeRepository(supabase)
    const useCase = new ListNoticesUseCase(repository)

    return await useCase.execute()
  } catch {
    console.warn("⚠️ Não foi possível carregar avisos do Supabase (conexão falhou). Exibindo dados simulados de visualização.")
    return getMockNotices()
  }
}
