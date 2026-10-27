import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import type { UpdateState } from '../../shared/updateState'
import App from './App'

// Probably browser mode (not electron)
if (window.api === undefined) {
  window.api = {
    GetThemeName: async (): Promise<string | null> => {
      return localStorage.getItem('themeName')
    },
    SetThemeName: async (themeName: string): Promise<void> => {
      localStorage.setItem('themeName', themeName)
    },
    installUpdate: (): void => {},
    getAppVersion: (): string => '0.0.0',
    getUpdateState: async (): Promise<UpdateState> => ({ status: 'idle' }),
    checkForUpdates: (): void => {}
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
