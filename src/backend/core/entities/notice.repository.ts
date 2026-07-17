import { Notice, CreateNoticeInput } from "./notice.schema"

export interface NoticeRepository {
  create(input: CreateNoticeInput): Promise<Notice>
  list(): Promise<Notice[]>
}
