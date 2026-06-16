import { SocialProvider } from '@socialkit/core'

export interface PostInput {
  page: string
  message: string
  link?: string
}

export async function postCommand(provider: SocialProvider, input: PostInput): Promise<string> {
  const result = await provider.publishPost(input.page, { message: input.message, link: input.link })
  return `Posted: ${result.id}`
}
