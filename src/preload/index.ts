import { contextBridge, ipcRenderer } from "electron"
import { IPC, type SortedLoadingSaves } from "../main/ipc"

const api = {
  getSortedLoadingSaves: (): SortedLoadingSaves => {
    return ipcRenderer.sendSync(IPC.GET_SORTED_LOADING_SAVES)
  },
  setGold: async (saveId: string, gold: number): Promise<boolean> => {
    return ipcRenderer.invoke(IPC.SET_GOLD, saveId, gold)
  },
  setEssence: async (saveId: string, essence: number): Promise<boolean> => {
    return ipcRenderer.sendSync(IPC.SET_ESSENCE, saveId, essence)
  },
  setHealth: async (saveId: string, health: number): Promise<boolean> => {
    return ipcRenderer.sendSync(IPC.SET_HEALTH, saveId, health)
  },
  setStamina: async (saveId: string, stamina: number): Promise<boolean> => {
    return ipcRenderer.sendSync(IPC.SET_STAMINA, saveId, stamina)
  },
  setMana: async (saveId: string, mana: number): Promise<boolean> => {
    return ipcRenderer.sendSync(IPC.SET_MANA, saveId, mana)
  }
}

export type Api = typeof api
contextBridge.exposeInMainWorld("api", api)
