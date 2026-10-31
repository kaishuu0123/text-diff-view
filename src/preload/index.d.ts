import { ElectronAPI } from '@electron-toolkit/preload'
import { UpdateState } from '../shared/updateState'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      GetThemeName: () => Promise<string | null>
      SetThemeName: (themeName: string) => Promise<void>
      installUpdate: () => void
      getAppVersion: () => string
      getUpdateState: () => Promise<UpdateState>
      checkForUpdates: () => void
      popupMenu: () => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (cb: (maximized: boolean) => void) => void
    }
  }
}
