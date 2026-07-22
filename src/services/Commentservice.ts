import api from './api'
import type { Comment, CommentPayload } from '@/types/comment'
import type { RawApiEnvelope } from '@/types/leave'

export const commentService = {

  async getComments(leaveRequestId: number): Promise<Comment[]> {
    const { data } = await api.get<RawApiEnvelope<Comment[]>>('/comments', {
      params: { leave_request_id: leaveRequestId },
    })
    return data.data
  },

  async addComment(payload: CommentPayload): Promise<Comment> {
    const { data } = await api.post<RawApiEnvelope<Comment>>('/comments', payload)
    return data.data
  },

  async updateComment(id: number, body: string): Promise<Comment> {
    const { data } = await api.put<RawApiEnvelope<Comment>>(`/comments/${id}`, { body })
    return data.data
  },

  async deleteComment(id: number): Promise<void> {
    await api.delete(`/comments/${id}`)
  },
}
