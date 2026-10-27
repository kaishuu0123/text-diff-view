import { app, ipcMain, type WebContents } from 'electron'
import pkg from 'electron-updater'
import type { UpdateState } from '../shared/updateState'

const { autoUpdater } = pkg

let state: UpdateState = { status: 'idle' }
let getWebContents: () => WebContents | undefined = () => undefined

function setState(next: UpdateState): void {
  state = next
  const webContents = getWebContents()
  if (webContents && !webContents.isDestroyed()) {
    webContents.send('update-state', state)
  }
}

export function checkForUpdates(): void {
  if (!app.isPackaged) {
    setState({ status: 'error', error: 'dev' })
    return
  }

  // 確認中・DL中・DL済みのときに再チェックしても、イベントが再発行されなかったり無駄になるだけ
  if (
    state.status === 'checking' ||
    state.status === 'available' ||
    state.status === 'downloaded'
  ) {
    return
  }

  // 失敗は 'error' イベントで state に反映されるので、ここでは握りつぶす
  autoUpdater.checkForUpdates().catch(() => {})
}

export function initAutoUpdater(getTarget: () => WebContents | undefined): void {
  getWebContents = getTarget

  ipcMain.handle('get-update-state', () => state)
  ipcMain.on('check-for-updates-now', () => checkForUpdates())
  ipcMain.on('install-update', () => autoUpdater.quitAndInstall())

  // 開発環境では動かさない
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => setState({ status: 'checking' }))
  autoUpdater.on('update-available', (info) =>
    setState({ status: 'available', version: info.version })
  )
  autoUpdater.on('update-not-available', () => setState({ status: 'up-to-date' }))
  autoUpdater.on('update-downloaded', (info) =>
    setState({ status: 'downloaded', version: info.version })
  )
  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err)
    const code = (err as NodeJS.ErrnoException).code
    setState({ status: 'error', error: code ? `${code}: ${err.message}` : err.message })
  })

  checkForUpdates()
}
