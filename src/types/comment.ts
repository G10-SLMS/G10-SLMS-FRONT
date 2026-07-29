export interface CommentAuthor {
  id: number
  name: string
  avatar_url: string | null
}

export interface Comment {
  id: number
  leave_request_id: number
  parent_id: number | null
  user_id: number
  user: CommentAuthor | null
  body: string
  replies: Comment[]
  edited_at: string | null
  created_at: string
  updated_at: string
}

export interface CommentPayload {
  leave_request_id: number
  body: string
  parent_id?: number
}
