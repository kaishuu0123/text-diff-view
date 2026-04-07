import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  GetThemeName: (): Promise<string> => {
    return ipcRenderer.invoke('GetThemeName')
  },
  SetThemeName: (themeName: string): Promise<boolean> => {
    return ipcRenderer.invoke('SetThemeName', themeName)
  },
  installUpdate: (): void => {
    ipcRenderer.send('install-update')
  },
  getAppVersion: (): string => {
    return ipcRenderer.sendSync('get-app-version')
  },
  checkForUpdates: (): void => {
    ipcRenderer.send('check-for-updates-now')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
