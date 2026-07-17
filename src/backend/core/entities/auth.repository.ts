import type { AuthUser, SignInInput, SignUpInput } from "@backend/core/entities/auth.schema"

export interface SignUpResult {
  user: AuthUser
  needsEmailConfirmation: boolean
}

export interface SignInResult {
  user: AuthUser
}

export interface AuthRepository {
  signUp(input: SignUpInput): Promise<SignUpResult>
  signIn(input: SignInInput): Promise<SignInResult>
  signOut(): Promise<void>
  getUser(): Promise<AuthUser | null>
}
