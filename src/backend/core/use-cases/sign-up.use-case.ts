import type { AuthRepository, SignUpResult } from "@backend/core/entities/auth.repository"
import type { SignUpInput } from "@backend/core/entities/auth.schema"

export class SignUpUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(input: SignUpInput): Promise<SignUpResult> {
    return this.authRepository.signUp(input)
  }
}
