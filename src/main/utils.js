import os from "os"
import { execFile } from "child_process"
import path from "path"
import { promisify } from "util"
import { readFile, writeFile, readdir, access, rm } from "fs/promises"

const execFileAsync = promisify(execFile)

export const isDev = process.env["NODE_ENV"] === "development"
export const isProd = process.env["NODE_ENV"] === "production"

export const rootPath = path.join(__dirname, "..", "..")
export const vaultcPath = path.join(rootPath, "vaultc.exe")
export const homePath = os.homedir()
export const appDataPath = path.join(homePath, "AppData")
export const tempPath = path.join(appDataPath, "Local", "Temp")
export const fomSavesPath = path.join(appDataPath, "Local", "FieldsOfMistria", "saves")
export const tempSavesPath = path.join(tempPath, "hacks-of-mistria")

export function getTestingDir() {
  const timestamp = Math.floor(Date.now() / 1000)
  return path.join(tempPath, `testing-${timestamp}`)
}

export const jsonFileNames = [
  "beach",
  "checksums",
  "deep_woods",
  "earth_seal",
  "eastern_road",
  "farm",
  "fire_seal",
  "game_stats",
  "gamedata",
  "haydens_farm",
  "header",
  "info",
  "narrows",
  "npcs",
  "player",
  "player_home",
  "quests",
  "summit",
  "town",
  "water_seal",
  "western_ruins"
]

export const PronounsList = {
  they_them: "they_them",
  she_her: "she_her",
  he_him: "he_him",
  she_they: "she_they",
  they_she: "they_she",
  he_they: "he_they",
  they_he: "they_he",
  he_she: "he_she",
  she_he: "she_he",
  it_its: "it_its",
  all: "all",
  none: "none"
}

export function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value)
}

/**
 * @desc Translates the calendar_time variable in header.json into a more accessible format
 * @param time The calendar_time variable from header.json in seconds
 * @returns A tuple containing the clock time where
 * - calendarTime[0] = year
 * - calendarTime[1] = season
 * - calendarTime[2] = day
 */
export function translateCalendarTime(time) {
  // Spring = 0, Summer = 1, Fall = 2, Winter = 3
  // 86400 * 28 = 2419200 seconds = 1 month because 28 days per month
  // 2419200 * 4 = 9676800 seconds = 1 year
  const year = Math.floor(time / 9676800) + 1
  const season = Math.floor((time % 9676800) / 2419200) // convert seconds to months
  const day = Math.trunc((time % 2419200) / 86400) + 1 // days start at 0
  return [year, season, day]
}

/**
 * @desc Reads and parses a JSON file from a given path synchronously
 * @param filePath The path to the JSON file
 * @returns The parsed JSON object
 */
export async function parseJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, "utf-8"))
}

/**
 * @desc Serializes and writes data to a JSON file synchronously
 * @param filePath The path to the file
 * @param data The data to be written to the file
 */
export async function writeJsonFile(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
}

/**
 * @desc Deletes a directory if exists
 * @param dirPath The path to the directory to be deleted
 */
export async function deleteDirIfExists(dirPath) {
  try {
    await access(dirPath)
    await rm(dirPath, { recursive: true })
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error
    }
  }
}

/**
 * @desc Reads all the save files from the game's save directory (`fomSavesPath`) and returns their absolute paths
 * @returns An array with the absolute paths to all the save files in the game's save directory (`fomSavesPath`)
 */
export async function readFomSaves() {
  const files = await readdir(fomSavesPath)
  return files.filter((file) => file.endsWith(".sav")).map((file) => path.join(fomSavesPath, file))
}

/**
 * @desc The tool from NPC Studio for packing and unpacking save files
 * @link https://github.com/NPC-Studio/vaultc
 */
export const vaultc = {
  /**
   * @desc Packs a save file (a directory with the unpacked json files) into a single `.sav` file
   * @param savefilePath The path to the `.sav` file to be created
   * @param unpackDirPath The path to the directory containing the unpacked json files
   */
  packSave: async (savefilePath, unpackDirPath) => {
    await execFileAsync(vaultcPath, ["pack", savefilePath, unpackDirPath])
  },
  /**
   * @desc Unpacks a save file (a `.sav` file) into a directory with the unpacked json files
   * @param savefilePath The path to the `.sav` file to be unpacked
   * @param unpackDirPath The path to the directory where the unpacked json files will be saved
   */
  unpackSave: async (savefilePath, unpackDirPath) => {
    await execFileAsync(vaultcPath, ["unpack", savefilePath, unpackDirPath])
  }
}

/**
 * @desc Extracts the saveId from a save file path
 * @param savePath The absolute path to a save file
 * @returns The saveId extracted from the save file path
 * @example getSaveIdFromPath('C:/Users/username/AppData/Local/FieldsOfMistria/saves/game-1292331906-835634871.sav')
 * // returns 'game-1292331906-835634871'
 */
export function getSaveIdFromPath(savePath) {
  return path.basename(savePath).replace(".sav", "")
}

/**
 * @desc Gets the path to the directory where a save file should be unpacked
 * @param saveId The saveId extracted from the save file path (see the `getSaveIdFromPath` function)
 * @returns The path to the directory where the save file should be unpacked
 */
export function getUnpackPathFromSaveId(saveId) {
  return path.join(tempSavesPath, saveId)
}

/**
 * @summary A cache with path info about the unpacked saves.
 * @desc It's a Map where:
 * - the key is the saveId (see the `getSaveIdFromPath` function)
 * - the value is an object with the unpacked save info (see the `UnpackedSavePathInfo` type)
 * It doesn't contain any parsed data, just paths to the unpacked files.
 */
export const unpackedSavesPathsCache = new Map()

/**
 * @desc Unpacks all the save files from the game's save directory (`fomSavesPath`) to a temporary directory (`tempSavesPath`)
 * It also updates the `unpackedSavesPathsCache` with the new unpacked save info.
 */
export async function unpackSavesToTemp() {
  await deleteDirIfExists(tempSavesPath)

  const fomSaves = await readFomSaves()

  for (const fomSavePath of fomSaves) {
    const saveId = getSaveIdFromPath(fomSavePath)
    const unpackDirPath = getUnpackPathFromSaveId(saveId)

    await deleteDirIfExists(unpackDirPath)
    await vaultc.unpackSave(fomSavePath, unpackDirPath)

    const unpackedSaveInfo = {
      unpackPath: unpackDirPath,
      fomSavePath: fomSavePath,
      saveId,
      jsonPaths: {
        beach: path.join(unpackDirPath, "beach.json"),
        checksums: path.join(unpackDirPath, "checksums.json"),
        deep_woods: path.join(unpackDirPath, "deep_woods.json"),
        earth_seal: path.join(unpackDirPath, "earth_seal.json"),
        eastern_road: path.join(unpackDirPath, "eastern_road.json"),
        farm: path.join(unpackDirPath, "farm.json"),
        fire_seal: path.join(unpackDirPath, "fire_seal.json"),
        game_stats: path.join(unpackDirPath, "game_stats.json"),
        gamedata: path.join(unpackDirPath, "gamedata.json"),
        haydens_farm: path.join(unpackDirPath, "haydens_farm.json"),
        header: path.join(unpackDirPath, "header.json"),
        info: path.join(unpackDirPath, "info.json"),
        narrows: path.join(unpackDirPath, "narrows.json"),
        npcs: path.join(unpackDirPath, "npcs.json"),
        player: path.join(unpackDirPath, "player.json"),
        player_home: path.join(unpackDirPath, "player_home.json"),
        quests: path.join(unpackDirPath, "quests.json"),
        summit: path.join(unpackDirPath, "summit.json"),
        town: path.join(unpackDirPath, "town.json"),
        water_seal: path.join(unpackDirPath, "water_seal.json"),
        western_ruins: path.join(unpackDirPath, "western_ruins.json")
      }
    }

    unpackedSavesPathsCache.set(saveId, unpackedSaveInfo)
  }
}

/**
 * @desc Updates a value in a JSON file (Needs to be tested for arrays. It should work I think?!)
 * @param filePath The path to the JSON file
 * @param key The key to be updated in the JSON file. It can also be a nested key separated by dots (e.g. 't2_world_facts.ari_name')
 * @param value The new value to be set
 */
export async function updateJsonValue(filePath, key, value) {
  const file = await parseJsonFile(filePath)
  const keys = key.split(".")

  let current = file

  for (let i = 0; i < keys.length - 1; i++) {
    let key = keys[i]

    if (!current[key]) {
      current[key] = {}
    }

    current = current[key]
  }

  current[keys[keys.length - 1]] = value

  await writeJsonFile(filePath, file)
}
