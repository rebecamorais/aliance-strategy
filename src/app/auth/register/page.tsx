import { AuthCard } from "@/frontend/components/auth/auth-card"
import { SignUpForm } from "@/frontend/components/auth/sign-up-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <AuthCard
      title="Criar conta"
      description="Registre-se com e-mail e senha. Um perfil será criado automaticamente."
      footer={
        <Link href="/" className="text-indigo hover:text-brand">
          ← Voltar ao início
        </Link>
      }
    >
      <SignUpForm />
    </AuthCard>
  )
}
