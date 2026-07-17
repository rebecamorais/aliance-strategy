import { GroupRepository } from "../entities/group.repository"

export class ApplyToGroupUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(profileId: string, groupId: string): Promise<void> {
    const isMember = await this.groupRepository.isMember(profileId, groupId)
    if (isMember) {
      throw new Error("You already are a member of this group.")
    }

    const hasPending = await this.groupRepository.hasPendingApplication(profileId, groupId)
    if (hasPending) {
      throw new Error("You already have a pending application for this group.")
    }

    await this.groupRepository.apply(profileId, groupId)
  }
}
