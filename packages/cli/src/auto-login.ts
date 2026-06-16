export interface AutoLoginOptions {
  email?: string
  password?: string
  headless?: boolean
}

export interface AutoLoginResult {
  accessToken: string
  userId?: string
}

export async function autoLoginFacebook(options: AutoLoginOptions = {}): Promise<AutoLoginResult> {
  let playwright: any
  try {
    playwright = await import('playwright')
  } catch {
    throw new Error('playwright not installed. Run: npx playwright install chromium')
  }

  const browser = await playwright.chromium.launch({
    headless: options.headless ?? false,
  })

  const context = await browser.newContext()
  const page = await context.newPage()

  let capturedToken: string | null = null

  page.on('response', async (response: any) => {
    const url = response.url()
    if (url.includes('graph.facebook.com') && url.includes('access_token=')) {
      const match = url.match(/access_token=([^&]+)/)
      if (match) capturedToken = match[1]
    }
  })

  await page.goto('https://facebook.com', { waitUntil: 'networkidle' })

  if (options.email && options.password) {
    await page.fill('#email', options.email)
    await page.fill('#pass', options.password)
    await page.click('[name="login"]')
    await page.waitForTimeout(3000)
  }

  await page.goto('https://facebook.com', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  const tokenFromPage = await page.evaluate(() => {
    return (window as any).__accessToken || null
  }).catch(() => null)

  await browser.close()

  const token = capturedToken || tokenFromPage
  if (!token) throw new Error('Could not extract access token. Try logging in manually first.')

  return { accessToken: token }
}
