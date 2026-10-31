import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import type { UpdateState } from '../shared/updateState'

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
  getUpdateState: (): Promise<UpdateState> => {
    return ipcRenderer.invoke('get-update-state')
  },
  checkForUpdates: (): void => {
    ipcRenderer.send('check-for-updates-now')
  },
  popupMenu: (): void => {
    ipcRenderer.send('popup-application-menu')
  },
  minimizeWindow: (): void => {
    ipcRenderer.send('minimize-window')
  },
  maximizeWindow: (): void => {
    ipcRenderer.send('maximize-window')
  },
  closeWindow: (): void => {
    ipcRenderer.send('close-window')
  },
  isMaximized: (): Promise<boolean> => {
    return ipcRenderer.invoke('is-maximized')
  },
  onMaximizeChange: (cb: (maximized: boolean) => void): void => {
    ipcRenderer.on('maximize-changed', (_event, value: boolean) => cb(value))
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
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
