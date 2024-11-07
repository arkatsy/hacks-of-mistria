import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import path from 'path'
import { HeaderJson } from './json-types'
import { readJsonFile, vaultc } from './utils'

// Electron runs first and then, when is ready it runs the callback we passed.
app.whenReady().then(async () => {
  electronApp.setAppUserModelId('moths-cheats')

  // this is where we unpack the saves initially, before even creating the window
  flushSavesToTemp()

  // this is where the main window is being created
  const mainWindow = new BrowserWindow({
    width: 1050,
    minWidth: 800,
    maxWidth: 1050,
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
})

// https://www.electronjs.org/docs/latest/api/ipc-main
// https://www.electronjs.org/docs/latest/tutorial/ipc
// communicating between the main and the renderer process happens through the IPC (Inter-Process Communication)
// for example the `handleGetSaves` function will be called when the renderer process sends a 'get-saves' message like
// this from the renderer process:
// ipcRenderer.send('get-saves')
// ipcRenderer.invoke('get-saves')
// ipcRenderer.sendSync('get-saves')
// https://www.electronjs.org/docs/latest/api/ipc-renderer
ipcMain.on('get-saves', (e) => {
  const allSaves = Array.from(savesCache.values())
  const parsedSaves = allSaves.map((saveInfo) => parseHeader(saveInfo.paths.header))

  e.returnValue = parsedSaves
})

type UnpackedSaveInfo = {
  unpackPath: string
  saveId: string
  originalSavePath: string
  paths: {
    header: string
    player: string
  }
}

// a map is like a dictionary in python, key value pairs
// this is what the savesCache looks like:
/*
{
  "game-87234918-12929378": {unpackPath: "...", saveId: "...", originalSavePath: "...", paths: {...}}
  "game-13448239-89471981": {unpackPath: "...", saveId: "...", originalSavePath: "...", paths: {...}}
  "game-12981787-99178728": {unpackPath: "...", saveId: "...", originalSavePath: "...", paths: {...}}
}
*/
const savesCache = new Map<string, UnpackedSaveInfo>()

const homePath = app.getPath('home')
const appDataPath = path.join(homePath, 'AppData', 'Local')
const tempPath = app.getPath('temp')
const fomSavesPath = path.join(appDataPath, 'FieldsOfMistria', 'saves')
const tempSavesPath = path.join(tempPath, 'moths-cheats-temp')

function getSaveIdFromPath(savePath: string) {
  return path.basename(savePath).replace('.sav', '')
}

function flushSavesToTemp() {
  if (fs.existsSync(tempSavesPath)) {
    fs.rmSync(tempSavesPath, { recursive: true })
  }

  const saves = fs
    .readdirSync(fomSavesPath)
    .filter((file) => file.endsWith('.sav'))
    .map((file) => path.join(fomSavesPath, file))
    .sort((fileA, fileB) => fs.statSync(fileB).mtime.getTime() - fs.statSync(fileA).mtime.getTime()) // sort by last modified

  for (const savefilePath of saves) {
    const saveId = getSaveIdFromPath(savefilePath)
    const unpackDirPath = path.join(tempSavesPath, saveId)

    if (fs.existsSync(unpackDirPath)) {
      fs.rmSync(unpackDirPath, { recursive: true })
    }

    vaultc.unpackSave(savefilePath, unpackDirPath)

    const unpackedSaveInfo: UnpackedSaveInfo = {
      unpackPath: unpackDirPath,
      saveId: saveId,
      originalSavePath: savefilePath,
      paths: {
        header: path.join(unpackDirPath, 'header.json'),
        player: path.join(unpackDirPath, 'player.json')
      }
    }

    savesCache.set(saveId, unpackedSaveInfo)
  }
}

function parseHeader(unpackedPath: string) {
  const {
    farm_name: farmName,
    playtime,
    clock_time: clockTime,
    calendar_time: calendarTime,
    name,
    stats: { gold, essence, renown }
  } = readJsonFile<HeaderJson>(path.join(unpackedPath))

  return {
    farmName,
    playtime,
    clockTime,
    calendarTime,
    name,
    gold,
    essence,
    renown
  }
}

// exporting the return type of the parseHeader so i can use it on the renderer process
export type ParsedHeader = ReturnType<typeof parseHeader>
