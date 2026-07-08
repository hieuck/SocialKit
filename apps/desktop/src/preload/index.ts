import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('socialkit', {
  run: (argv: string[]) => ipcRenderer.invoke('cli:run', argv),
  getPlatforms: () => ipcRenderer.invoke('app:getPlatforms'),
  login: (platform: string) => ipcRenderer.invoke('oauth:login', platform),
  getLoginUrl: (platform: string) => ipcRenderer.invoke('oauth:getLoginUrl', platform),
  exchangeCode: (platform: string, code: string) => ipcRenderer.invoke('oauth:exchangeCode', platform, code),
})
