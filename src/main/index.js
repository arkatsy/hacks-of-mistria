import { app, shell, BrowserWindow, ipcMain } from "electron"
import { join } from "path"
import { electronApp } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset"
import { isDev, unpackSavesToTemp } from "./utils"
import { channels } from "./ipc"

app.whenReady().then(async () => {
  electronApp.setAppUserModelId("hacks-of-mistria")

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

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
  })

  await unpackSavesToTemp()

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
    mainWindow.webContents.on("before-input-event", (_, input) => {
      if (input.type === "keyDown" && input.key === "F12") {
        mainWindow.webContents.isDevToolsOpened()
          ? mainWindow.webContents.closeDevTools()
          : mainWindow.webContents.openDevTools({ mode: "right" })
      }
    })

    import("electron-devtools-installer")
      .then((mod) => {
        const { default: installExtension, REACT_DEVELOPER_TOOLS } = mod

        installExtension(REACT_DEVELOPER_TOOLS)
          .then((name) => console.log(`Added Extension:  ${name}`))
          .catch((err) => console.log("Couldn't load react devtools: ", err))
      })
      .catch((msg) => {
        console.error(`Couldn't load electron-devtools-installer: ${msg}`)
      })
  }
})

Object.keys(channels).forEach((channelName) => {
  ipcMain.handle(channelName, channels[channelName])
})
