import type { AuthRepository } from "@backend/core/entities/auth.repository"
import type { AuthUser } from "@backend/core/entities/auth.schema"

export class GetSessionUseCase {
  constructor(private authRepository: AuthRepository) {}

  execute(): Promise<AuthUser | null> {
    return this.authRepository.getUser()
  }
}
