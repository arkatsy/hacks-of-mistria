import { app } from "electron";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

export const homeDirPath = app.getPath("home");
export const fomDirPath = path.join(homeDirPath, "AppData", "Local", "FieldsOfMistria");
export const fomSavesDirPath = path.join(fomDirPath, "saves");
export const tempSavesDirPath = path.join(app.getPath("temp"), "moths-cheats-temp-saves");
export const vaultcPath = path.join(fomDirPath, "vaultc");

export function translatePlaytime(time: number) {
  // 1 -> 0:00:01
  // 61 -> 0:01:01
  // 22229.607 -> 6:10:29
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function readJsonFile<T = Record<string, never>>(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function getSaveIdFromPath(file: string) {
  // "C:\Users\user\AppData\Local\FieldsOfMistria\saves\1258923-2830912.sav" -> "1258923-2830912"
  return path.basename(file).split(".")[0];
}

export const vaultc = {
  unpackSave(savefilePath: string, unpackDirPath: string) {
    execFileSync(vaultcPath, ["unpack", savefilePath, unpackDirPath]);
  },
  packSave(unpackDirPath: string, savefilePath: string) {
    execFileSync(vaultcPath, ["pack", unpackDirPath, savefilePath]);
  },
};
