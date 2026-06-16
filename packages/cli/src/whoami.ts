import { SocialProvider } from '@socialkit/core'

export async function whoamiCommand(provider: SocialProvider): Promise<string> {
  const profile = await provider.getProfile()
  let result = `${profile.name} (${profile.id})`
  if (profile.email) result += `\nEmail: ${profile.email}`
  if (profile.pictureUrl) result += `\nPicture: ${profile.pictureUrl}`
  return result
}
