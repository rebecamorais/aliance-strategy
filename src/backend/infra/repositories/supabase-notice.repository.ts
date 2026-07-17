import { NoticeRepository } from "@backend/core/entities/notice.repository"
import { Notice, CreateNoticeInput } from "@backend/core/entities/notice.schema"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "@backend/infra/supabase/types"

export class SupabaseNoticeRepository implements NoticeRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(input: CreateNoticeInput): Promise<Notice> {
    const { data, error } = await this.supabase
      .from("notices")
      .insert({
        title: input.title,
        content: input.content,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar aviso no Supabase: ${error.message}`)
    }

    if (!data) {
      throw new Error("Erro ao criar aviso: nenhum dado retornado")
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      created_at: data.created_at,
    }
  }

  async list(): Promise<Notice[]> {
    const { data, error } = await this.supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Erro ao listar avisos no Supabase: ${error.message}`)
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      created_at: row.created_at,
    }))
  }
}
