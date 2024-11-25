import { app, shell, BrowserWindow, ipcMain } from "electron"
import { join } from "path"
import { electronApp } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset"
import { isDev, unpackSavesToTemp } from "./utils"
import { channels } from "./ipc"

// Electron runs first and then, when is ready it runs the callback we passed.
app.whenReady().then(async () => {
  electronApp.setAppUserModelId("hacks-of-mistria")

  // this is where we unpack the saves initially, before even creating the window
  await unpackSavesToTemp()

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
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  })

  mainWindow.removeMenu()

  // The `ready-to-show` event is emitted when the renderer process has rendered the page for the first time.
  // This is the reason why loading the saves sync initially is not a big problem. In the worst the app will just feel slow to open.
  // https://www.electronjs.org/docs/latest/api/browser-window#using-the-ready-to-show-event
  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"])
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
})

Object.keys(channels).forEach((channelName) => {
  ipcMain.handle(channelName, channels[channelName])
})
