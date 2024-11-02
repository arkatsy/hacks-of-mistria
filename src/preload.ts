import { contextBridge, ipcRenderer } from "electron";
import { IPC_EVENTS } from "./ipc-channels";

const api = {
  getSaveMetadata: (saveId: string) => ipcRenderer.sendSync(IPC_EVENTS.GET_SAVE_METADATA, saveId),
  getSaveNames: () => ipcRenderer.sendSync(IPC_EVENTS.GET_SAVE_NAMES),
  refreshSaves: () => ipcRenderer.sendSync(IPC_EVENTS.REFRESH_SAVES),
};

contextBridge.exposeInMainWorld("api", api);

export type API = typeof api;
