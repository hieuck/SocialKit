import { app, BrowserWindow, ipcMain } from 'electron'
import { Session, ProviderRegistry, Cli } from '@socialkit/cli'
import { FacebookProvider } from '@socialkit/provider-facebook'
import { InstagramProvider } from '@socialkit/provider-instagram'
import { ZaloProvider } from '@socialkit/provider-zalo'
import { join } from 'path'
import { homedir } from 'os'
import { existsSync, mkdirSync } from 'fs'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

function setupCli(): Cli {
  const dir = join(homedir(), '.socialkit')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const session = new Session(join(dir, 'session.json'))
  const registry = new ProviderRegistry()

  registry.register('facebook', () => new FacebookProvider({
    appId: process.env.SOCIALKIT_FACEBOOK_APP_ID || '',
    appSecret: process.env.SOCIALKIT_FACEBOOK_APP_SECRET || '',
  }))
  registry.register('instagram', () => new InstagramProvider({
    appId: process.env.SOCIALKIT_INSTAGRAM_APP_ID || '',
    appSecret: process.env.SOCIALKIT_INSTAGRAM_APP_SECRET || '',
    igUserId: process.env.SOCIALKIT_INSTAGRAM_IG_USER_ID || '',
  }))
  registry.register('zalo', () => new ZaloProvider({
    appId: process.env.SOCIALKIT_ZALO_APP_ID || '',
    appSecret: process.env.SOCIALKIT_ZALO_APP_SECRET || '',
  }))

  return new Cli({ session, registry })
}

const cli = setupCli()

ipcMain.handle('cli:run', async (_event, argv: string[]) => {
  try {
    return await cli.run(argv)
  } catch (err) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`
  }
})

ipcMain.handle('app:getPlatforms', () => {
  return ['facebook', 'instagram', 'zalo']
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
