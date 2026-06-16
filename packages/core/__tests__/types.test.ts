import {
  SocialProfile,
  SocialPage,
  SocialPost,
  SocialComment,
  SocialAttachment,
  PaginatedResponse,
  SocialTokenResponse,
} from '../src/types'

describe('SocialProfile type', () => {
  it('creates a valid profile object', () => {
    const profile: SocialProfile = { id: '123', name: 'Alice' }
    expect(profile.id).toBe('123')
    expect(profile.name).toBe('Alice')
  })

  it('accepts optional pictureUrl', () => {
    const profile: SocialProfile = { id: '1', name: 'A', pictureUrl: 'https://pic.url' }
    expect(profile.pictureUrl).toBeDefined()
  })
})

describe('SocialPage type', () => {
  it('creates a valid page object', () => {
    const page: SocialPage = { id: 'page1', name: 'Test Page' }
    expect(page.id).toBe('page1')
  })
})

describe('SocialPost type', () => {
  it('creates a valid post object', () => {
    const post: SocialPost = { id: 'post1', message: 'Hello', createdAt: '2024-01-01' }
    expect(post.message).toBe('Hello')
  })
})

describe('SocialComment type', () => {
  it('creates a valid comment object', () => {
    const comment: SocialComment = { id: 'c1', message: 'nice', createdAt: '2024-01-01', likeCount: 0 }
    expect(comment.likeCount).toBe(0)
  })
})

describe('PaginatedResponse type', () => {
  it('creates a paginated response', () => {
    const resp: PaginatedResponse<SocialPost> = {
      data: [{ id: 'p1', message: 'hi', createdAt: '2024-01-01' }]
    }
    expect(resp.data).toHaveLength(1)
  })
})

describe('SocialTokenResponse type', () => {
  it('creates a token response', () => {
    const token: SocialTokenResponse = { accessToken: 'abc', expiresIn: 3600 }
    expect(token.accessToken).toBe('abc')
  })
})

describe('SocialAttachment type', () => {
  it('creates an attachment', () => {
    const att: SocialAttachment = { type: 'photo', title: 'pic', url: 'https://img.url' }
    expect(att.type).toBe('photo')
  })
})

