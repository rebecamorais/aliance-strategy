import { CreateNoticeInput, Notice } from "../entities/notice.schema"
import { NoticeRepository } from "../entities/notice.repository"

export class CreateNoticeUseCase {
  constructor(private noticeRepository: NoticeRepository) {}

  async execute(input: CreateNoticeInput): Promise<Notice> {
    // Aqui poderiam residir regras de negócio específicas
    return this.noticeRepository.create(input)
  }
}
