import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import fs from "fs";
import { IPC_EVENTS } from "./ipc-channels";
import { fomSavesDirPath, getSaveIdFromPath, readJsonFile, tempSavesDirPath, vaultc, vaultcPath } from "./utils";
import { HeaderJson } from "./json-types";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

app.whenReady().then(() => {
  app.setAppUserModelId("com.arkatsy.mothscheats");
  flushSavesToTemp();

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.webContents.openDevTools();

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
});

// ==============================

type UnpackedSaveInfo = {
  unpackPath: string;
  saveId: string;
  originalSavePath: string;
  paths: {
    header: string;
    player: string;
  };
};

const savesCache = new Map<string, UnpackedSaveInfo>();

function flushSavesToTemp() {
  if (fs.existsSync(tempSavesDirPath)) {
    fs.rmSync(tempSavesDirPath, { recursive: true });
  }

  const saves = fs
    .readdirSync(fomSavesDirPath)
    .filter((file) => file.endsWith(".sav"))
    .map((file) => path.join(fomSavesDirPath, file))
    .sort((fileA, fileB) => fs.statSync(fileB).mtime.getTime() - fs.statSync(fileA).mtime.getTime()); // sort by last modified

  for (const savefilePath of saves) {
    const saveId = getSaveIdFromPath(savefilePath);
    const unpackDirPath = path.join(tempSavesDirPath, saveId);

    if (fs.existsSync(unpackDirPath)) {
      fs.rmSync(unpackDirPath, { recursive: true });
    }

    vaultc.unpackSave(savefilePath, unpackDirPath);

    const unpackedSaveInfo: UnpackedSaveInfo = {
      unpackPath: unpackDirPath,
      saveId: saveId,
      originalSavePath: savefilePath,
      paths: {
        // TODO: Add all the json files
        header: path.join(unpackDirPath, "header.json"),
        player: path.join(unpackDirPath, "player.json"),
      },
    };

    savesCache.set(saveId, unpackedSaveInfo);
  }
}

function parseHeader(unpackedPath: string) {
  const {
    farm_name: farmName,
    playtime,
    clock_time: clockTime,
    calendar_time: calendarTime,
    stats: { gold, essence, renown },
  } = readJsonFile<HeaderJson>(path.join(unpackedPath, "header.json"));

  return {
    farmName,
    playtime,
    clockTime,
    calendarTime,
    gold,
    essence,
    renown,
  };
}

function handleGetSaveMetadata(e: Electron.IpcMainEvent, saveId: string) {
  const unpackedSaveInfo = savesCache.get(saveId);
  const saveData = parseHeader(unpackedSaveInfo.paths.header);

  e.returnValue = saveData;
}

function handleGetSaveNames(e: Electron.IpcMainEvent) {
  const saveFiles = fs
    .readdirSync(fomSavesDirPath)
    .filter((file) => file.endsWith(".sav"))
    .map((filePath) => path.basename(filePath));

  e.returnValue = saveFiles;
}

function handleRefreshSaves(e: Electron.IpcMainEvent) {
  flushSavesToTemp();
  e.returnValue = true;
}

ipcMain.on(IPC_EVENTS.GET_SAVE_METADATA, handleGetSaveMetadata);
ipcMain.on(IPC_EVENTS.GET_SAVE_NAMES, handleGetSaveNames);
ipcMain.on(IPC_EVENTS.REFRESH_SAVES, handleRefreshSaves);
