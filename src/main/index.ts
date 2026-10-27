import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, Menu, type MenuItemConstructorOptions, shell } from 'electron'
import ElectronStore from 'electron-store'
import icon from '../../resources/icon.png?asset'
import { initAutoUpdater } from './updater'

type StoreType = {
  themeName?: string
}

const store = new ElectronStore<StoreType>({
  defaults: {
    themeName: 'light'
  }
})

if (process.platform !== 'darwin') {
  // Disable Application Menu when boot except darwin
  Menu.setApplicationMenu(null)
}

let mainWindow: BrowserWindow

// macOS はアプリケーションメニューが残るので、アプリ内 About に統一した自前のメニューを使う
function buildMacMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      // ネイティブの About パネルではなく、アプリ内の About ダイアログを開く
      label: app.name,
      submenu: [
        { label: 'About Text Diff View', click: () => mainWindow.webContents.send('menu-about') },
        {
          label: 'Check for Updates…',
          click: () => mainWindow.webContents.send('menu-check-for-updates')
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => mainWindow.webContents.send('menu-check-for-updates')
        },
        { type: 'separator' },
        { label: 'About Text Diff View', click: () => mainWindow.webContents.send('menu-about') }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow(): void {
  // Create the browser window.
  // Position, size and maximized state are persisted and restored by Electron itself,
  // which also keeps the window on a connected display when monitors change.
  mainWindow = new BrowserWindow({
    name: 'main-window',
    windowStatePersistence: true,
    width: 800,
    height: 600,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process?.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process?.env.ELECTRON_RENDERER_URL)
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

  // App version (synchronous)
  ipcMain.on('get-app-version', (event) => {
    event.returnValue = app.getVersion()
  })

  if (process.platform === 'darwin') buildMacMenu()

  createWindow()

  initAutoUpdater(() => mainWindow?.webContents)

  app.on('activate', () => {
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
