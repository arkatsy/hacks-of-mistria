import { contextBridge, ipcRenderer } from 'electron'
import { ChannelNames } from '../main/ipc-channels'
import { SortedLoadingSaves } from '../shared'

// NOTE: Don't forget to add the types to the shared `src/shared/index.ts` file

const api = {
  getSortedLoadingSaves: (): SortedLoadingSaves => {
    return ipcRenderer.sendSync(ChannelNames['get/sorted-loading-saves'])
  }
}

export type Api = typeof api
contextBridge.exposeInMainWorld('api', api)
