import type { AuthRepository, SignInResult } from "@backend/core/entities/auth.repository"
import type { SignInInput } from "@backend/core/entities/auth.schema"

export class SignInUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(input: SignInInput): Promise<SignInResult> {
    return this.authRepository.signIn(input)
  }
}
