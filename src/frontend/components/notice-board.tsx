"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { createNoticeAction } from "@/app/actions/notice.actions"
import type { ActionResponse } from "@shared/action-response"
import { Button } from "./ui/button"
import { Notice } from "@backend/core/entities/notice.schema"

interface NoticeBoardProps {
  initialNotices: Notice[]
}

// Componente utilitário para evitar erros de hidratação (Hydration Mismatch) com datas
function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState<string>("")

  useEffect(() => {
    setFormatted(
      new Date(dateString).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }, [dateString])

  return <span>{formatted || "---"}</span>
}

export function NoticeBoard({ initialNotices }: NoticeBoardProps) {
  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    createNoticeAction,
    { success: false, message: "" }
  )

  const formRef = useRef<HTMLFormElement>(null)

  // Limpa o formulário quando a mutação é executada com sucesso
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset()
    }
  }, [state])

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-4 py-8">
      {/* Seção de Formulário - 5 Colunas */}
      <section className="md:col-span-5">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm sticky top-8 transition-all hover:shadow-md">
          <h2 className="text-xl font-medium text-body tracking-tight mb-2">
            Novo Comunicado
          </h2>
          <p className="text-muted text-xs mb-6">
            Publique um aviso importante no mural público da empresa.
          </p>

          <form ref={formRef} action={formAction} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-body font-medium text-xs">
                Título do Aviso
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="Ex: Reunião Geral de Alinhamento"
                className={`w-full px-3.5 py-2 text-sm text-body rounded-lg bg-page border transition-all duration-200 focus:outline-none focus:ring-2 ${
                  state.errors?.title
                    ? "border-error focus:ring-error/20"
                    : "border-border focus:border-brand-light focus:ring-brand-subtle"
                }`}
              />
              {state.errors?.title && (
                <span className="text-error text-[11px] font-medium mt-0.5">
                  {state.errors.title[0]}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="content" className="text-body font-medium text-xs">
                Conteúdo detalhado
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={5}
                placeholder="Descreva aqui os detalhes importantes do comunicado..."
                className={`w-full px-3.5 py-2 text-sm text-body rounded-lg bg-page border transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                  state.errors?.content
                    ? "border-error focus:ring-error/20"
                    : "border-border focus:border-brand-light focus:ring-brand-subtle"
                }`}
              />
              {state.errors?.content && (
                <span className="text-error text-[11px] font-medium mt-0.5">
                  {state.errors.content[0]}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand text-white hover:bg-brand-light active:bg-brand-dark transition-all duration-200 font-medium py-2 rounded-lg shadow-sm"
            >
              {isPending ? "Publicando..." : "Publicar Aviso"}
            </Button>

            {/* Toasts / Feedback de Status */}
            {state.message && !state.errors && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  state.success
                    ? "bg-success/10 border-success/30 text-success"
                    : "bg-error/10 border-error/30 text-error"
                }`}
              >
                {state.message}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Seção de Listagem - 7 Colunas */}
      <section className="md:col-span-7 space-y-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-body tracking-tight">
            Avisos Recentes
          </h2>
          <span className="bg-brand-subtle text-brand-dark text-xs font-medium px-3 py-0.5 rounded-full border border-brand-lighter shadow-2xs">
            {initialNotices.length} avisos
          </span>
        </div>

        {initialNotices.length === 0 ? (
          <div className="bg-surface border border-border border-dashed rounded-2xl p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-brand-subtle text-brand flex items-center justify-center mx-auto mb-4 font-medium text-xl border border-brand-lighter shadow-2xs">
              📢
            </div>
            <h3 className="text-body font-medium text-sm mb-1">
              Mural Vazio
            </h3>
            <p className="text-muted text-xs max-w-xs mx-auto">
              Nenhum comunicado foi postado ainda. Seja o primeiro a criar um aviso ao lado!
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {initialNotices.map((notice) => (
              <article
                key={notice.id}
                className="bg-surface border border-border rounded-xl p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-medium text-body group-hover:text-brand transition-colors text-base leading-tight">
                    {notice.title}
                  </h3>
                  <time className="text-muted text-[10px] shrink-0 font-medium bg-page px-2 py-0.5 rounded-md border border-border">
                    <FormattedDate dateString={notice.created_at} />
                  </time>
                </div>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
