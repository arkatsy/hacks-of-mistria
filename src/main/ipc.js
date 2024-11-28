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
  MEASURE_UNPACKING: "measure/unpacking",
  UPDATE_SAVE: "update/save",
  GET_SORTED_LOADING_SAVES: "get/sorted-loading-saves",
  REFRESH_SAVES: "refresh/saves",
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
  SET_MANA: "set/mana",
  SET_REWARD_INVENTORY: "set/reward-inventory"
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
  [IPC.SET_REWARD_INVENTORY]: handleSetRewardInventory
}

async function handleMeasureUnpacking(e, amount) {
  if (!isNumber(amount) || amount < 1) {
    console.log(`[handleMeasureUnpacking]: Invalid amount ${amount}`)
    return
  }
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

async function handleUpdateSave(e, saveId) {
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
    ...(await Promise.all(
      unpackedSavesInfo.map(async (_saveInfo) => {
        const infoData = await parseJsonFile(_saveInfo.jsonPaths.info)
        return infoData.last_played
      })
    ))
  )

  await updateJsonValue(saveInfo.jsonPaths.info, "last_played", longestLastPlayed + 0.00000000001)
  await vaultc.packSave(saveInfo.unpackPath, saveInfo.fomSavePath)

  await unpackSaveToTemp(saveInfo.fomSavePath)

  return true
}

async function handleGetSortedLoadingSaves(e) {
  console.log(`[handleGetSortedLoadingSaves]`)
  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())

  const sortedSavesByLastPlayed = await Promise.all(
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

  sortedSavesByLastPlayed.sort((a, b) => b.info.last_played - a.info.last_played)

  return sortedSavesByLastPlayed
}

async function handleRefreshSaves(e) {
  await unpackSavesToTemp()
  return true
}

async function handleGetSaveData(e, saveId) {
  console.log(`[handleGetSaveData:${saveId}]`)
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`[handleGetSaveData:${saveId}]: Couldn't find save in cache`)
    return null
  }

  const headerData = await parseJsonFile(saveInfo.jsonPaths.header)
  const playerData = await parseJsonFile(saveInfo.jsonPaths.player)

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
    reward_inventory: playerData.renown_reward_inventory
  }
}

async function handleSetName(e, saveId, name) {
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

  await updateJsonValue(jsonPaths.header, "name", name)
  await updateJsonValue(jsonPaths.player, "name", name)

  return true
}

async function handleSetPronouns(e, saveId, pronouns) {
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

  await updateJsonValue(jsonPaths.player, "pronoun_choice", pronouns)

  return true
}

async function handleSetFarmName(e, saveId, farmName) {
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

  await updateJsonValue(jsonPaths.header, "farm_name", farmName)
  await updateJsonValue(jsonPaths.player, "farm_name", farmName)

  return true
}

async function handleSetGold(e, saveId, gold) {
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

  await updateJsonValue(jsonPaths.header, "stats.gold", gold)
  await updateJsonValue(jsonPaths.player, "stats.gold", gold)

  return true
}

async function handleSetEssence(e, saveId, essence) {
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

  await updateJsonValue(jsonPaths.header, "stats.essence", essence)
  await updateJsonValue(jsonPaths.player, "stats.essence", essence)

  return true
}

async function handleSetRenown(e, saveId, renown) {
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

  await updateJsonValue(jsonPaths.header, "stats.renown", renown)
  await updateJsonValue(jsonPaths.player, "stats.renown", renown)

  return true
}

async function handleSetCalendarTime(e, saveId, calendarTime) {
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

  await updateJsonValue(jsonPaths.header, "calendar_time", calendarTime)
  await updateJsonValue(jsonPaths.gamedata, "date", calendarTime)
  //TODO: IMPLEMENT DAY OF THE WEEK

  return true
}

async function handleSetHealth(e, saveId, health) {
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

  await updateJsonValue(jsonPaths.header, "stats.base_health", health)
  await updateJsonValue(jsonPaths.header, "stats.health_current", health)
  await updateJsonValue(jsonPaths.player, "stats.base_health", health)
  await updateJsonValue(jsonPaths.player, "stats.health_current", health)

  return true
}

async function handleSetStamina(e, saveId, stamina) {
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

  await updateJsonValue(jsonPaths.header, "stats.base_stamina", stamina)
  await updateJsonValue(jsonPaths.header, "stats.stamina_current", stamina)
  await updateJsonValue(jsonPaths.player, "stats.base_stamina", stamina)
  await updateJsonValue(jsonPaths.player, "stats.stamina_current", stamina)

  return true
}

async function handleSetMana(e, saveId, mana) {
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

  await updateJsonValue(jsonPaths.header, "stats.mana_max", mana)
  await updateJsonValue(jsonPaths.header, "stats.mana_current", mana)
  await updateJsonValue(jsonPaths.player, "stats.mana_max", mana)
  await updateJsonValue(jsonPaths.player, "stats.mana_current", mana)

  return true
}

function handleSetRewardInventory(e, saveId, inventory) {
  console.log(`[handleSetRewardInventory:${saveId}]: Updating reward inventory to ${inventory}`)

  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    console.log(`couldn't find save with id ${saveId} in cache`)
    return false
  }

  // TODO: validate inventory

  const { jsonPaths } = saveInfo

  return updateJsonValue(jsonPaths.player, "renown_reward_inventory", inventory)
}