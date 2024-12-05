import {
  unpackedSavesPathsCache,
  updateJsonValue,
  vaultc,
  isNumber,
  PronounsList,
  translateCalendarTime,
  getTestingDir,
  readFomSaves,
  getSaveIdFromPath,
  deleteDirIfExists,
  parseJsonFile,
  unpackSaveToTemp,
  unpackSavesToTemp
} from "./utils"

import { join } from "path"
import { mkdir, copyFile, readdir } from "fs/promises"

export const IPC = {
  MEASURE_UNPACKING: "MEASURE_UNPACKING",
  UPDATE_SAVE: "UPDATE_SAVE",
  GET_SORTED_LOADING_SAVES: "GET_SORTED_LOADING_SAVES",
  REFRESH_SAVES: "REFRESH_SAVES",
  GET_SAVE_DATA: "GET_SAVE_DATA",
  SET_NAME: "SET_NAME",
  SET_PRONOUNS: "SET_PRONOUNS",
  SET_FARM_NAME: "SET_FARM_NAME",
  SET_GOLD: "SET_GOLD",
  SET_ESSENCE: "SET_ESSENCE",
  SET_RENOWN: "SET_RENOWN",
  SET_CALENDAR_TIME: "SET_CALENDAR_TIME",
  SET_HEALTH: "SET_HEALTH",
  SET_STAMINA: "SET_STAMINA",
  SET_MANA: "SET_MANA",
  SET_REWARD_INVENTORY: "SET_REWARD_INVENTORY",
  SET_BIRTHDAY: "SET_BIRTHDAY",
  SET_INVENTORY: "SET_INVENTORY"
}

export const channels = {
  [IPC.MEASURE_UNPACKING]: handleMeasureUnpacking,
  [IPC.UPDATE_SAVE]: handleUpdateSave,
  [IPC.GET_SORTED_LOADING_SAVES]: handleGetSortedLoadingSaves,
  [IPC.REFRESH_SAVES]: handleRefreshSaves,
  [IPC.GET_SAVE_DATA]: handleGetSaveData,
  [IPC.SET_NAME]: handleSetName,
  [IPC.SET_PRONOUNS]: handleSetPronouns,
  [IPC.SET_FARM_NAME]: handleSetFarmName,
  [IPC.SET_GOLD]: handleSetGold,
  [IPC.SET_ESSENCE]: handleSetEssence,
  [IPC.SET_RENOWN]: handleSetRenown,
  [IPC.SET_CALENDAR_TIME]: handleSetCalendarTime,
  [IPC.SET_HEALTH]: handleSetHealth,
  [IPC.SET_STAMINA]: handleSetStamina,
  [IPC.SET_MANA]: handleSetMana,
  [IPC.SET_REWARD_INVENTORY]: handleSetRewardInventory,
  [IPC.SET_BIRTHDAY]: handleSetBirthday,
  [IPC.SET_INVENTORY]: handleSetInventory
}

async function handleMeasureUnpacking(_, amount) {
  if (!isNumber(amount) || amount < 1) return
  const testingDir = getTestingDir()
  const testSavePath = (await readFomSaves())[0]
  const saveBasename = getSaveIdFromPath(testSavePath)

  await mkdir(testingDir)

  for (let i = 1; i <= amount; i++) {
    await copyFile(testSavePath, join(testingDir, `${saveBasename}-${i}.sav`))
  }

  const startTime = process.hrtime()
  const savesToUnpack = (await readdir(testingDir)).map((file) => join(testingDir, file))

  for (const savePath of savesToUnpack) {
    const unpackDir = join(testingDir, getSaveIdFromPath(savePath))
    await vaultc.unpackSave(savePath, unpackDir)
  }

  const endTime = process.hrtime(startTime)
  const measurement = endTime[0] + endTime[1] / 1e9 // Convert to seconds

  await deleteDirIfExists(testingDir)

  return measurement
}

async function handleUpdateSave(_, saveId) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) return

  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())
  const longestLastPlayed = Math.max(
    ...(await Promise.all(
      unpackedSavesInfo.map(async (_saveInfo) => {
        const infoData = await parseJsonFile(_saveInfo.jsonPaths.info)
        return infoData.last_played
      })
    ))
  )

  const currentLastPlayedTime = (await parseJsonFile(saveInfo.jsonPaths.info)).last_played
  if (!Object.is(currentLastPlayedTime, longestLastPlayed)) {
    // bring the save to the top in-game
    await updateJsonValue(saveInfo.jsonPaths.info, "last_played", longestLastPlayed + 0.00000000001)
  }

  await vaultc.packSave(saveInfo.unpackPath, saveInfo.fomSavePath)
  await unpackSaveToTemp(saveInfo.fomSavePath)
}

async function handleGetSortedLoadingSaves() {
  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())

  const saves = await Promise.all(
    unpackedSavesInfo.map(async (saveInfo) => {
      const infoData = await parseJsonFile(saveInfo.jsonPaths.info)
      const headerData = await parseJsonFile(saveInfo.jsonPaths.header)
      return {
        info: infoData,
        header: headerData,
        id: saveInfo.saveId,
        autosave: saveInfo.saveId.includes("autosave")
      }
    })
  )

  return saves.sort((a, b) => b.info.last_played - a.info.last_played)
}

async function handleRefreshSaves() {
  await unpackSavesToTemp()
}

async function handleGetSaveData(_, saveId) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) return

  const headerData = await parseJsonFile(saveInfo.jsonPaths.header)
  const playerData = await parseJsonFile(saveInfo.jsonPaths.player)
  const gamedataData = await parseJsonFile(saveInfo.jsonPaths.gamedata)

  return {
    name: headerData.name,
    farmName: headerData.farm_name,
    pronouns: playerData.pronoun_choice,
    gold: headerData.stats.gold,
    essence: headerData.stats.essence,
    renown: headerData.stats.renown,
    calendarTime: headerData.calendar_time,
    year: translateCalendarTime(headerData.calendar_time)[0],
    season: translateCalendarTime(headerData.calendar_time)[1],
    day: translateCalendarTime(headerData.calendar_time)[2],
    health: headerData.stats.base_health,
    stamina: headerData.stats.base_stamina,
    mana: headerData.stats.mana_max,
    rewardInventory: playerData.renown_reward_inventory,
    inventory: playerData.inventory,
    birthdaySeason: translateCalendarTime(playerData.birthday)[1],
    birthdayDay: translateCalendarTime(playerData.birthday)[2],
    maxMinesLevel: gamedataData.maximum_mines_level
  }
}

async function handleSetName(_, saveId, name) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || typeof name !== "string") return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "name", name)
  await updateJsonValue(jsonPaths.player, "name", name)
}

async function handleSetPronouns(_, saveId, pronouns) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !(pronouns in PronounsList)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.player, "pronoun_choice", pronouns)
}

async function handleSetFarmName(_, saveId, farmName) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || typeof farmName !== "string") return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "farm_name", farmName)
  await updateJsonValue(jsonPaths.player, "farm_name", farmName)
}

async function handleSetGold(_, saveId, gold) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(gold)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "stats.gold", gold)
  await updateJsonValue(jsonPaths.player, "stats.gold", gold)
}

async function handleSetEssence(e, saveId, essence) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(essence)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "stats.essence", essence)
  await updateJsonValue(jsonPaths.player, "stats.essence", essence)
}

async function handleSetRenown(_, saveId, renown) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(renown)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "stats.renown", renown)
  await updateJsonValue(jsonPaths.player, "stats.renown", renown)
}

async function handleSetCalendarTime(_, saveId, calendarTime) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(calendarTime) || calendarTime % 86400 !== 0) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "calendar_time", calendarTime)
  await updateJsonValue(jsonPaths.gamedata, "date", calendarTime)
}

async function handleSetHealth(_, saveId, health) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(health)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "stats.base_health", health)
  await updateJsonValue(jsonPaths.header, "stats.health_current", health)
  await updateJsonValue(jsonPaths.player, "stats.base_health", health)
  await updateJsonValue(jsonPaths.player, "stats.health_current", health)
}

async function handleSetStamina(_, saveId, stamina) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(stamina)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "stats.base_stamina", stamina)
  await updateJsonValue(jsonPaths.header, "stats.stamina_current", stamina)
  await updateJsonValue(jsonPaths.player, "stats.base_stamina", stamina)
  await updateJsonValue(jsonPaths.player, "stats.stamina_current", stamina)
}

async function handleSetMana(_, saveId, mana) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(mana)) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.header, "stats.mana_max", mana)
  await updateJsonValue(jsonPaths.header, "stats.mana_current", mana)
  await updateJsonValue(jsonPaths.player, "stats.mana_max", mana)
  await updateJsonValue(jsonPaths.player, "stats.mana_current", mana)
}

function handleSetRewardInventory(_, saveId, inventory) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !inventory) return

  const { jsonPaths } = saveInfo
  updateJsonValue(jsonPaths.player, "renown_reward_inventory", inventory)
}

async function handleSetBirthday(_, saveId, birthday) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !isNumber(birthday) || birthday % 86400 !== 0) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.player, "birthday", birthday)
}

async function handleSetInventory(_, saveId, inventory) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo || !inventory) return

  const { jsonPaths } = saveInfo
  await updateJsonValue(jsonPaths.player, "inventory", inventory)
}
