import type { AuthRepository } from "@backend/core/entities/auth.repository"

export class SignOutUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): Promise<void> {
    return this.authRepository.signOut()
  }
}
