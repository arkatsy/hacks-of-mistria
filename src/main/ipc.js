import {
  unpackedSavesPathsCache,
  updateJsonValue,
  parseInfoJson,
  parseHeaderJson,
  vaultc,
  unpackSavesToTemp,
  isNumber
} from "./utils"

import { translateCalendarTime } from "./utils"

export const IPC = {
  UPDATE_SAVE: "update/save",
  GET_SORTED_LOADING_SAVES: "get/sorted-loading-saves",
  GET_SAVE_DATA: "get/save-data",
  SET_GOLD: "set/gold",
  SET_ESSENCE: "set/essence",
  SET_RENOWN: "set/renown",
  SET_CALENDAR_TIME: "set/calendar-time"
}

export const channels = {
  [IPC.UPDATE_SAVE]: handleUpdateSave,
  [IPC.GET_SORTED_LOADING_SAVES]: handleGetSortedLoadingSaves,
  [IPC.GET_SAVE_DATA]: handleGetSaveData,
  [IPC.SET_GOLD]: handleSetGold,
  [IPC.SET_ESSENCE]: handleSetEssence,
  [IPC.SET_RENOWN]: handleSetRenown,
  [IPC.SET_CALENDAR_TIME]: handleSetCalendarTime
}

function handleUpdateSave(e, saveId) {
  console.log(`[handleUpdateSave:${saveId}]`)

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`[handleUpdateSave:${saveId}]: Couldn't find save in cache`)
    return false
  }

  const { jsonPaths } = saveInfo
  const infoData = parseInfoJson(jsonPaths.info)
  updateJsonValue(jsonPaths.info, "last_played", infoData.last_played + 0.00000000001)

  vaultc.packSave(saveInfo.unpackPath, saveInfo.fomSavePath)

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
  // const playerData = parseHeaderJson(saveInfo.jsonPaths.player)

  return {
    name: headerData.name,
    farmName: headerData.farm_name,
    gold: headerData.stats.gold,
    essence: headerData.stats.essence,
    renown: headerData.stats.renown,
    calendarTime: headerData.calendar_time,
    year: translateCalendarTime(headerData.calendar_time)[0],
    season: translateCalendarTime(headerData.calendar_time)[1],
    day: translateCalendarTime(headerData.calendar_time)[2]
  }
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
  console.log(`[handleSetRenown:${saveId}]: Updating essence to ${renown}`)

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
    console.log(`[handleSetCalendarTime:${saveId}]: Calendar time is not a number ${calendarTime}, won't update`)
    return false
  }

  if (calendarTime % 86400 != 0) {
    console.log(`[handleSetCalendarTime:${saveId}]: Calendar time ${calendarTime} is not a multiple of 86400, won't update`)
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
  //TODO: RENAME TO DATE

  return true
}