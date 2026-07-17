import { Notice } from "../entities/notice.schema"
import { NoticeRepository } from "../entities/notice.repository"

export class ListNoticesUseCase {
  constructor(private noticeRepository: NoticeRepository) {}

  async execute(): Promise<Notice[]> {
    return this.noticeRepository.list()
  }
}
