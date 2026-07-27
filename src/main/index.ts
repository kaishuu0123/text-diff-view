import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { app, shell, BrowserWindow, ipcMain, Menu, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import ElectronStore from 'electron-store'

type StoreType = {
  themeName?: string
  windowWidth?: number
  windowHeight?: number
  windowX?: number
  windowY?: number
}

const store = new ElectronStore<StoreType>({
  defaults: {
    themeName: 'light',
    windowWidth: 800,
    windowHeight: 600
  }
})

if (process.platform !== 'darwin') {
  // Disable Application Menu when boot except darwin
  Menu.setApplicationMenu(null)
}

let mainWindow: BrowserWindow

export function initAutoUpdater(win: BrowserWindow): void {
  // 開発環境では動かさない
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('update-checking')
  })

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update-not-available')
  })

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err)
    win.webContents.send('update-error', err.message)
  })

  autoUpdater.checkForUpdates()
}

function createWindow(): void {
  const savedWidth = store.get('windowWidth') ?? 800
  const savedHeight = store.get('windowHeight') ?? 600
  let savedX = store.get('windowX')
  let savedY = store.get('windowY')

  if (savedX != null && savedY != null) {
    const displays = screen.getAllDisplays()
    const isVisible = displays.some((display) => {
      const { x, y, width, height } = display.workArea
      return (
        savedX! + savedWidth > x &&
        savedX! < x + width &&
        savedY! + savedHeight > y &&
        savedY! < y + height
      )
    })
    if (!isVisible) {
      savedX = undefined
      savedY = undefined
    }
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    ...(savedX != null && savedY != null ? { x: savedX, y: savedY } : {}),
    width: savedWidth,
    height: savedHeight,
    show: false,
    autoHideMenuBar: true,
    useContentSize: true,
    ...(process?.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    },
    resizable: true
  })

  if (savedX == null || savedY == null) {
    mainWindow.center()
  }

  const saveWindowState = (): void => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isMinimized()) {
      const bounds = mainWindow.getBounds()
      store.set('windowX', bounds.x)
      store.set('windowY', bounds.y)
      store.set('windowWidth', bounds.width)
      store.set('windowHeight', bounds.height)
    }
  }

  mainWindow.on('resize', saveWindowState)
  mainWindow.on('move', saveWindowState)
  mainWindow.on('close', saveWindowState)

  screen.on('display-removed', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds()
      const displays = screen.getAllDisplays()

      // 現在のウィンドウ領域が、有効なディスプレイのいずれかと重なっているか判定
      const isVisible = displays.some((display) => {
        const { x, y, width, height } = display.workArea
        return (
          bounds.x + bounds.width > x &&
          bounds.x < x + width &&
          bounds.y + bounds.height > y &&
          bounds.y < y + height
        )
      })

      // 画面外に出てしまっている場合は画面中央（プライマリディスプレイ）へ復元
      if (!isVisible) {
        mainWindow.center()
      }
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process?.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process?.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('me.saino.text-diff-view')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.handle('GetThemeName', () => {
    return store.get('themeName')
  })

  ipcMain.handle('SetThemeName', (_event, data) => {
    store.set('themeName', data)
  })

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  // App version (synchronous)
  ipcMain.on('get-app-version', (event) => {
    event.returnValue = app.getVersion()
  })

  // Trigger update check from renderer (e.g. About dialog)
  ipcMain.on('check-for-updates-now', () => {
    if (!app.isPackaged) {
      mainWindow.webContents.send('update-error', 'dev')
      return
    }
    autoUpdater.checkForUpdates()
  })

  createWindow()

  initAutoUpdater(mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process?.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
