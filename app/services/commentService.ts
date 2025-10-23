import { IComment } from "@/interface/script"

import { Api } from "./api"
import { ApiResult } from "./api/types"

export class CommentService {
  constructor(private httpClient: Api) {}
  writeComment(part_id: number, content: string): Promise<ApiResult<IComment>> {
    return this.httpClient.post<IComment>(`/comment/${part_id}`, { content })
  }
  geCommentsByPart(part_id: number): Promise<ApiResult<Array<IComment>>> {
    return this.httpClient.get<Array<IComment>>(`/comment/${part_id}`)
  }
  replyComment(part_id: number, comment_id: number, content: string): Promise<ApiResult<IComment>> {
    return this.httpClient.post<IComment>(`/comment/${part_id}/${comment_id}/replies`, { content })
  }
  like(comment_id: number): Promise<ApiResult<{ like: boolean; likes_count: number }>> {
    return this.httpClient.patch<{ like: boolean; likes_count: number }>(
      `/comment/${comment_id}/like`,
    )
  }
  unlike(comment_id: number): Promise<ApiResult<{ like: boolean; likes_count: number }>> {
    return this.httpClient.patch<{ like: boolean; likes_count: number }>(
      `/comment/${comment_id}/unlike`,
    )
  }

  async remove(commentId: number): Promise<void> {
    await this.httpClient.delete(`/comments/${commentId}`)
  }
}

export const commentService = new CommentService(new Api())
