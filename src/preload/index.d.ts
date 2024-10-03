import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      GetThemeName: () => Promise<string>
      SetThemeName: (themeName: string) => Promise<boolean>
    }
  }
}
