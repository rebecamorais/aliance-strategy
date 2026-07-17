import type {
  AuthRepository,
  SignInResult,
  SignUpResult,
} from "@backend/core/entities/auth.repository"
import type { AuthUser, SignInInput, SignUpInput } from "@backend/core/entities/auth.schema"
import type { Database } from "@backend/infra/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"

function mapUser(
  id: string,
  email: string | undefined,
  fullName: string | null | undefined
): AuthUser {
  return {
    id,
    email: email ?? "",
    fullName: fullName ?? null,
  }
}

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async signUp(input: SignUpInput): Promise<SignUpResult> {
    const trimmedName = input.fullName?.trim()
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: trimmedName ? { full_name: trimmedName } : undefined,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Não foi possível criar a conta. Tente novamente.")
    }

    return {
      user: mapUser(
        data.user.id,
        data.user.email,
        (data.user.user_metadata?.full_name as string | undefined) ?? null
      ),
      needsEmailConfirmation: !data.session,
    }
  }

  async signIn(input: SignInInput): Promise<SignInResult> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error("Credenciais inválidas.")
    }

    return {
      user: mapUser(
        data.user.id,
        data.user.email,
        (data.user.user_metadata?.full_name as string | undefined) ?? null
      ),
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getUser(): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    return mapUser(
      data.user.id,
      data.user.email,
      (data.user.user_metadata?.full_name as string | undefined) ?? null
    )
  }
}
