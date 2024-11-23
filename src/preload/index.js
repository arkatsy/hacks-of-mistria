import { contextBridge, ipcRenderer } from "electron"
import { IPC } from "../main/ipc"

const api = {
  measureUnpacking: async (amount) => ipcRenderer.invoke(IPC.MEASURE_UNPACKING, amount),
  updateSave: async (saveId) => ipcRenderer.invoke(IPC.UPDATE_SAVE, saveId),
  getSortedLoadingSaves: () => ipcRenderer.sendSync(IPC.GET_SORTED_LOADING_SAVES),
  getSaveData: async (saveId) => ipcRenderer.invoke(IPC.GET_SAVE_DATA, saveId),
  setName: async (saveId, name) => ipcRenderer.invoke(IPC.SET_NAME, saveId, name),
  setPronouns: async (saveId, pronouns) => ipcRenderer.invoke(IPC.SET_PRONOUNS, saveId, pronouns),
  setFarmName: async (saveId, farmName) => ipcRenderer.invoke(IPC.SET_FARM_NAME, saveId, farmName),
  setGold: async (saveId, gold) => ipcRenderer.invoke(IPC.SET_GOLD, saveId, gold),
  setEssence: async (saveId, essence) => ipcRenderer.invoke(IPC.SET_ESSENCE, saveId, essence),
  setRenown: async (saveId, renown) => ipcRenderer.invoke(IPC.SET_RENOWN, saveId, renown),
  setCalendarTime: async (saveId, calendarTime) =>
    ipcRenderer.invoke(IPC.SET_CALENDAR_TIME, saveId, calendarTime),
  setHealth: async (saveId, health) => ipcRenderer.invoke(IPC.SET_HEALTH, saveId, health),
  setStamina: async (saveId, stamina) => ipcRenderer.invoke(IPC.SET_STAMINA, saveId, stamina),
  setMana: async (saveId, mana) => ipcRenderer.invoke(IPC.SET_MANA, saveId, mana)
}

contextBridge.exposeInMainWorld("api", api)
