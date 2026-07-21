export interface Comment {
  id: number
  authorId: number
  authorName: string
  authorAvatarUrl?: string | null
  text: string
  createdAt: string
}
