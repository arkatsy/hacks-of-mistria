import {
  unpackedSavesPathsCache,
  updateJsonValue,
  parseInfoJson,
  parseHeaderJson,
  vaultc,
  unpackSavesToTemp,
  isNumber,
  PronounsList,
  translateCalendarTime,
  getTestingDir,
  readFomSaves,
  getSaveIdFromPath,
  deleteDirIfExists
} from "./utils"

import { join } from "node:path"
import { mkdirSync, cpSync, readdirSync } from "node:fs"

export const IPC = {
  MEASURE_UNPACKING: "measure/unpacking",
  UPDATE_SAVE: "update/save",
  GET_SORTED_LOADING_SAVES: "get/sorted-loading-saves",
  GET_SAVE_DATA: "get/save-data",
  SET_NAME: "set/name",
  SET_PRONOUNS: "set/pronouns",
  SET_FARM_NAME: "set/farm-name",
  SET_GOLD: "set/gold",
  SET_ESSENCE: "set/essence",
  SET_RENOWN: "set/renown",
  SET_CALENDAR_TIME: "set/calendar-time",
  SET_HEALTH: "set/health",
  SET_STAMINA: "set/stamina",
  SET_MANA: "set/mana"
}

export const channels = {
  [IPC.MEASURE_UNPACKING]: handleMeasureUnpacking,
  [IPC.UPDATE_SAVE]: handleUpdateSave,
  [IPC.GET_SORTED_LOADING_SAVES]: handleGetSortedLoadingSaves,
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
  [IPC.SET_MANA]: handleSetMana
}

function handleMeasureUnpacking(e, amount) {
  if (!isNumber(amount) || amount < 1) {
    console.log(`[handleMeasureUnpacking]: Invalid amount ${amount}`)
    return
  }
  const testingDir = getTestingDir()
  const testSavePath = readFomSaves()[0]
  const saveBasename = getSaveIdFromPath(testSavePath)

  mkdirSync(testingDir)

  for (let i = 1; i <= amount; i++) {
    cpSync(testSavePath, join(testingDir, `${saveBasename}-${i}.sav`))
  }

  const startTime = process.hrtime()
  const savesToUnpack = readdirSync(testingDir).map((file) => join(testingDir, file))

  for (const savePath of savesToUnpack) {
    const unpackDir = join(testingDir, getSaveIdFromPath(savePath))
    vaultc.unpackSave(savePath, unpackDir)
  }

  const endTime = process.hrtime(startTime)
  const measurement = endTime[0] + endTime[1] / 1e9 // Convert to seconds

  deleteDirIfExists(testingDir)

  return measurement
}

function handleUpdateSave(e, saveId) {
  console.log(`[handleUpdateSave:${saveId}]`)

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`[handleUpdateSave:${saveId}]: Couldn't find save in cache`)
    return false
  }

  // We find the max biggest `last_played` value and then
  // add a miniscule value to it to make the edited file show first in-game

  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())
  const longestLastPlayed = Math.max(
    ...unpackedSavesInfo.map((_saveInfo) => {
      const infoData = parseInfoJson(_saveInfo.jsonPaths.info)
      return infoData.last_played
    })
  )

  updateJsonValue(saveInfo.jsonPaths.info, "last_played", longestLastPlayed + 0.00000000001)
  vaultc.packSave(saveInfo.unpackPath, saveInfo.fomSavePath)

  // TODO: Instead of refreshing all the saves, we should refresh only the one we edited
  unpackSavesToTemp()
  return true
}

function handleGetSortedLoadingSaves(e) {
  console.log(`[handleGetSortedLoadingSaves]`)
  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())

  const sortedSavesByLastPlayed = unpackedSavesInfo
    .map((saveInfo) => {
      const infoData = parseInfoJson(saveInfo.jsonPaths.info)
      const headerData = parseHeaderJson(saveInfo.jsonPaths.header)
      return {
        info: infoData,
        header: headerData,
        id: saveInfo.saveId,
        autosave: saveInfo.saveId.includes("autosave")
      }
    })
    .sort((a, b) => b.info.last_played - a.info.last_played)

  e.returnValue = sortedSavesByLastPlayed
}

function handleGetSaveData(e, saveId) {
  console.log(`[handleGetSaveData:${saveId}]`)
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`[handleGetSaveData:${saveId}]: Couldn't find save in cache`)
    return null
  }

  const headerData = parseHeaderJson(saveInfo.jsonPaths.header)
  const playerData = parseHeaderJson(saveInfo.jsonPaths.player)

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
    mana: headerData.stats.mana_max
  }
}

function handleSetName(e, saveId, name) {
  console.log(`[handleSetName:${saveId}]: Updating name to ${name}`)

  if (!(typeof name === "string" || name instanceof String)) {
    console.log(`[handleSetName:${saveId}]: Name is not a string ${name}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "name", name)
  updateJsonValue(jsonPaths.player, "name", name)

  return true
}

function handleSetPronouns(e, saveId, pronouns) {
  console.log(`[handleSetPronouns:${saveId}]: Updating pronouns to ${pronouns}`)

  if (!(pronouns in PronounsList)) {
    console.log(`[handleSetPronouns:${saveId}]: invalid pronouns, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId}`)
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.player, "pronoun_choice", pronouns)

  return true
}

function handleSetFarmName(e, saveId, farmName) {
  console.log(`[handleSetFarmName:${saveId}]: Updating farm name to ${farmName}`)

  if (!(typeof farmName === "string" || farmName instanceof String)) {
    console.log(
      `[handleSetFarmName:${saveId}]: Farm name is not a string ${farmName}, won't update`
    )
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "farm_name", farmName)
  updateJsonValue(jsonPaths.player, "farm_name", farmName)

  return true
}

function handleSetGold(e, saveId, gold) {
  console.log(`[handleSetGold:${saveId}]: Updating gold to ${gold}`)

  if (!isNumber(gold)) {
    console.log(`[handleSetGold:${saveId}]: Gold is not a number ${gold}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.gold", gold)
  updateJsonValue(jsonPaths.player, "stats.gold", gold)

  return true
}

function handleSetEssence(e, saveId, essence) {
  console.log(`[handleSetEssence:${saveId}]: Updating essence to ${essence}`)

  if (!isNumber(essence)) {
    console.log(`[handleSetEssence:${saveId}]: Essence is not a number ${essence}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.essence", essence)
  updateJsonValue(jsonPaths.player, "stats.essence", essence)

  return true
}

function handleSetRenown(e, saveId, renown) {
  console.log(`[handleSetRenown:${saveId}]: Updating renown to ${renown}`)

  if (!isNumber(renown)) {
    console.log(`[handleSetRenown:${saveId}]: Renown is not a number ${renown}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.renown", renown)
  updateJsonValue(jsonPaths.player, "stats.renown", renown)

  return true
}

function handleSetCalendarTime(e, saveId, calendarTime) {
  console.log(`[handleSetCalendarTime:${saveId}]: Updating calendar time to ${calendarTime}`)

  if (!isNumber(calendarTime)) {
    console.log(
      `[handleSetCalendarTime:${saveId}]: Calendar time is not a number ${calendarTime}, won't update`
    )
    return false
  }

  if (calendarTime % 86400 != 0) {
    console.log(
      `[handleSetCalendarTime:${saveId}]: Calendar time ${calendarTime} is not a multiple of 86400, won't update`
    )
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "calendar_time", calendarTime)
  updateJsonValue(jsonPaths.gamedata, "date", calendarTime)
  //TODO: IMPLEMENT DAY OF THE WEEK

  return true
}

function handleSetHealth(e, saveId, health) {
  console.log(`[handleSetHealth:${saveId}]: Updating health to ${health}`)

  if (!isNumber(health)) {
    console.log(`[handleSetHealth:${saveId}]: Health is not a number ${health}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.base_health", health)
  updateJsonValue(jsonPaths.header, "stats.health_current", health)
  updateJsonValue(jsonPaths.player, "stats.base_health", health)
  updateJsonValue(jsonPaths.player, "stats.health_current", health)

  return true
}

function handleSetStamina(e, saveId, stamina) {
  console.log(`[handleSetStamina:${saveId}]: Updating stamina to ${stamina}`)

  if (!isNumber(stamina)) {
    console.log(`[handleSetStamina:${saveId}]: Stamina is not a number ${stamina}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.base_stamina", stamina)
  updateJsonValue(jsonPaths.header, "stats.stamina_current", stamina)
  updateJsonValue(jsonPaths.player, "stats.base_stamina", stamina)
  updateJsonValue(jsonPaths.player, "stats.stamina_current", stamina)

  return true
}

function handleSetMana(e, saveId, mana) {
  console.log(`[handleSetMana:${saveId}]: Updating mana to ${mana}`)

  if (!isNumber(mana)) {
    console.log(`[handleSetMana:${saveId}]: Mana is not a number ${mana}, won't update`)
    return false
  }

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.mana_max", mana)
  updateJsonValue(jsonPaths.header, "stats.mana_current", mana)
  updateJsonValue(jsonPaths.player, "stats.mana_max", mana)
  updateJsonValue(jsonPaths.player, "stats.mana_current", mana)

  return true
}
