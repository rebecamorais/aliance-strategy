import type { ReactNode } from "react"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-page text-body flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-violet text-lg font-medium text-white shadow-md shadow-brand/20">
            F
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-body">{title}</h1>
          <p className="mt-2 text-sm font-normal text-muted">{description}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm font-normal text-muted">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
