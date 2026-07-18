import { AuthCard } from "@/frontend/components/auth/auth-card"
import { SignInForm } from "@/frontend/components/auth/sign-in-form"
import Link from "next/link"

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const callbackError = params.error === "callback"

  return (
    <AuthCard
      title="Entrar na sua conta"
      description="Use o e-mail e a senha cadastrados no Supabase Auth."
      footer={
        <Link href="/" className="text-brand hover:text-brand-light">
          ← Voltar ao início
        </Link>
      }
    >
      <SignInForm callbackError={callbackError} />
    </AuthCard>
  )
}
