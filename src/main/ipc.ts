import { HeaderJson, InfoJson } from "../shared/jsons"
import { unpackedSavesPathsCache, updateJsonValue, parseInfoJson, parseHeaderJson } from "./utils"

export const IPC = {
  GET_SORTED_LOADING_SAVES: "get/sorted-loading-saves",
  SET_GOLD: "set/gold",
  SET_ESSENCE: "set/essence",
  SET_HEALTH: "set/health",
  SET_STAMINA: "set/stamina",
  SET_MANA: "set/mana"
} as const

export const channels = {
  [IPC.GET_SORTED_LOADING_SAVES]: handleGetSortedLoadingSaves,
  [IPC.SET_GOLD]: handleSetGold,
  [IPC.SET_ESSENCE]: handleSetEssence,
  [IPC.SET_HEALTH]: handleSetHealth,
  [IPC.SET_STAMINA]: handleSetStamina,
  [IPC.SET_MANA]: handleSetMana
} as const

function handleGetSortedLoadingSaves(e: Electron.IpcMainEvent) {
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
export type SortedLoadingSaves = {
  header: HeaderJson
  info: InfoJson
  id: string
  autosave: boolean
}[]

function handleSetGold(e: Electron.IpcMainInvokeEvent, saveId: string, gold: number) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.gold", gold)
  updateJsonValue(jsonPaths.player, "stats.gold", gold)

  return true
}

function handleSetEssence(e: Electron.IpcMainInvokeEvent, saveId: string, essence: number) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.essence", essence)
  updateJsonValue(jsonPaths.player, "stats.essence", essence)

  return true
}

function handleSetHealth(e: Electron.IpcMainInvokeEvent, saveId: string, health: number) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.base_health", health)
  updateJsonValue(jsonPaths.header, "stats.health_current", health)

  updateJsonValue(jsonPaths.player, "stats.base_health", health)
  updateJsonValue(jsonPaths.player, "stats.health_current", health)

  return true
}

function handleSetStamina(e: Electron.IpcMainInvokeEvent, saveId: string, stamina: number) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.base_stamina", stamina)
  updateJsonValue(jsonPaths.header, "stats.stamina_current", stamina)

  updateJsonValue(jsonPaths.player, "stats.base_stamina", stamina)
  updateJsonValue(jsonPaths.player, "stats.stamina_current", stamina)

  return true
}

function handleSetMana(e: Electron.IpcMainInvokeEvent, saveId: string, mana: number) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)
  if (!saveInfo) {
    return false
  }

  const { jsonPaths } = saveInfo

  updateJsonValue(jsonPaths.header, "stats.mana_max", mana)
  updateJsonValue(jsonPaths.header, "stats.mana_current", mana)

  updateJsonValue(jsonPaths.player, "stats.mana_max", mana)
  updateJsonValue(jsonPaths.player, "stats.mana_current", mana)

  return true
}
