export interface SocialProfile {
  id: string
  name: string
  email?: string
  pictureUrl?: string
}

export interface SocialPage {
  id: string
  name: string
  category?: string
}

export interface SocialPost {
  id: string
  message?: string
  createdAt: string
  updatedAt?: string
  attachments?: SocialAttachment[]
}

export interface SocialAttachment {
  type: string
  title?: string
  url?: string
}

export interface SocialComment {
  id: string
  message: string
  author?: { id: string; name: string }
  createdAt: string
  likeCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  cursor?: string
  hasMore?: boolean
}

export interface SocialTokenResponse {
  accessToken: string
  expiresIn: number
  tokenType?: string
}
