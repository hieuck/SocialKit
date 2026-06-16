import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('socialkit', {
  run: (argv: string[]) => ipcRenderer.invoke('cli:run', argv),
  getPlatforms: () => ipcRenderer.invoke('app:getPlatforms'),
  login: (platform: string) => ipcRenderer.invoke('oauth:login', platform),
})
