import { contextBridge, ipcRenderer } from "electron"
import { IPC } from "../main/ipc"

const api = {
  measureUnpacking: (amount) => ipcRenderer.invoke(IPC.MEASURE_UNPACKING, amount),
  updateSave: (saveId) => ipcRenderer.invoke(IPC.UPDATE_SAVE, saveId),
  getSortedLoadingSaves: () => ipcRenderer.invoke(IPC.GET_SORTED_LOADING_SAVES),
  refreshSaves: () => ipcRenderer.invoke(IPC.REFRESH_SAVES),
  getSaveData: (saveId) => ipcRenderer.invoke(IPC.GET_SAVE_DATA, saveId),
  setName: (saveId, name) => ipcRenderer.invoke(IPC.SET_NAME, saveId, name),
  setPronouns: (saveId, pronouns) => ipcRenderer.invoke(IPC.SET_PRONOUNS, saveId, pronouns),
  setFarmName: (saveId, farmName) => ipcRenderer.invoke(IPC.SET_FARM_NAME, saveId, farmName),
  setGold: (saveId, gold) => ipcRenderer.invoke(IPC.SET_GOLD, saveId, gold),
  setEssence: (saveId, essence) => ipcRenderer.invoke(IPC.SET_ESSENCE, saveId, essence),
  setRenown: (saveId, renown) => ipcRenderer.invoke(IPC.SET_RENOWN, saveId, renown),
  setCalendarTime: (saveId, calendarTime) =>
    ipcRenderer.invoke(IPC.SET_CALENDAR_TIME, saveId, calendarTime),
  setHealth: (saveId, health) => ipcRenderer.invoke(IPC.SET_HEALTH, saveId, health),
  setStamina: (saveId, stamina) => ipcRenderer.invoke(IPC.SET_STAMINA, saveId, stamina),
  setMana: (saveId, mana) => ipcRenderer.invoke(IPC.SET_MANA, saveId, mana)
}

contextBridge.exposeInMainWorld("api", api)
