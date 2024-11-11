import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      GetThemeName: () => Promise<string | null>
      SetThemeName: (themeName: string) => Promise<void>
    }
  }
}
