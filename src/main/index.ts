import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { unpackSavesToTemp } from './utils'
import { channels } from './ipc'

// Electron runs first and then, when is ready it runs the callback we passed.
app.whenReady().then(async () => {
  electronApp.setAppUserModelId('moths-cheats')

  // this is where we unpack the saves initially, before even creating the window
  unpackSavesToTemp()

  // this is where the main window is being created
  const mainWindow = new BrowserWindow({
    width: 1050,
    minWidth: 800,
    height: 750,
    minHeight: 600,
    resizable: true,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.removeMenu()

  // note how we set show: false above and then we show the window on 'ready-to-show' event.
  // the `ready-to-show` event is emitted when the renderer process has rendered the page for the first time.
  // https://www.electronjs.org/docs/latest/api/browser-window#using-the-ready-to-show-event
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // this is for links. when a link is clicked it will open in the default browser and not in the app.
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // for development stuff and auto reloading the renderer process on changes
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // https://github.com/alex8088/electron-toolkit/tree/master/packages/utils#optimizer
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mainWindow.webContents.openDevTools()
})

Object.keys(channels).forEach((channelName) => {
  ipcMain.on(channelName, channels[channelName])
})
