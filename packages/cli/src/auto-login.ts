export interface AutoLoginOptions {
  email?: string
  password?: string
  headless?: boolean
}

export interface AutoLoginResult {
  accessToken: string
  userId?: string
}

interface PlaywrightResponse {
  url: () => string
}

interface PlaywrightPage {
  evaluate: <T>(fn: () => T) => Promise<T>
  goto: (url: string, options?: { waitUntil?: string }) => Promise<void>
  fill: (selector: string, value: string) => Promise<void>
  click: (selector: string) => Promise<void>
  waitForTimeout: (ms: number) => Promise<void>
  on: (event: string, handler: (response: PlaywrightResponse) => void) => void
}

interface PlaywrightContext {
  newPage: () => Promise<PlaywrightPage>
}

interface PlaywrightBrowser {
  newContext: () => Promise<PlaywrightContext>
  close: () => Promise<void>
}

interface PlaywrightModule {
  chromium: {
    launch: (options?: { headless?: boolean }) => Promise<PlaywrightBrowser>
  }
}

declare global {
  interface Window {
    __accessToken?: string
  }
}

export async function autoLoginFacebook(options: AutoLoginOptions = {}): Promise<AutoLoginResult> {
  let playwright: PlaywrightModule
  try {
    playwright = await import('playwright') as unknown as PlaywrightModule
  } catch {
    throw new Error('playwright not installed. Run: npx playwright install chromium')
  }

  const browser = await playwright.chromium.launch({
    headless: options.headless ?? false,
  })

  const context = await browser.newContext()
  const page = await context.newPage() as PlaywrightPage

  let capturedToken: string | null = null

  page.on('response', async (response: PlaywrightResponse) => {
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
    return window.__accessToken || null
  }).catch(() => null)

  await browser.close()

  const token = capturedToken || tokenFromPage
  if (!token) throw new Error('Could not extract access token. Try logging in manually first.')

  return { accessToken: token }
}
