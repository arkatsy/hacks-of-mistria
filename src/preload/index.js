import { contextBridge, ipcRenderer } from "electron"
import { IPC } from "../main/ipc"

const api = {
  getSortedLoadingSaves: () => {
    return ipcRenderer.sendSync(IPC.GET_SORTED_LOADING_SAVES)
  },
  setGold: async (saveId, gold) => {
    return ipcRenderer.invoke(IPC.SET_GOLD, saveId, gold)
  },
  setEssence: async (saveId, essence) => {
    return ipcRenderer.sendSync(IPC.SET_ESSENCE, saveId, essence)
  },
  setHealth: async (saveId, health) => {
    return ipcRenderer.sendSync(IPC.SET_HEALTH, saveId, health)
  },
  setStamina: async (saveId, stamina) => {
    return ipcRenderer.sendSync(IPC.SET_STAMINA, saveId, stamina)
  },
  setMana: async (saveId, mana) => {
    return ipcRenderer.sendSync(IPC.SET_MANA, saveId, mana)
  }
}

contextBridge.exposeInMainWorld("api", api)
