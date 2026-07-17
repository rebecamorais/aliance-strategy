import { CreateGroupInput, Group } from "../entities/group.schema"
import { GroupRepository } from "../entities/group.repository"

export class CreateGroupUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(input: CreateGroupInput, creatorProfileId: string): Promise<Group> {
    return this.groupRepository.create(input, creatorProfileId)
  }
}
