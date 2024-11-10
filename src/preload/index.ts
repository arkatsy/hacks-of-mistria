import { contextBridge, ipcRenderer } from 'electron'
import { ChannelNames } from '../main/ipc-channels'
import { LoadingSaveInfo, SortedLoadingSaveIds } from '../shared'

// NOTE: Don't forget to add the types to the shared `src/shared/index.ts` file

const api = {
  getSortedLoadingSavesIds: (): SortedLoadingSaveIds => {
    return ipcRenderer.sendSync(ChannelNames['get/sorted-loading-saves-ids'])
  },
  getLoadingSaveInfo(saveId: string): LoadingSaveInfo {
    return ipcRenderer.sendSync(ChannelNames['get/loading-save-info'], saveId)
  }
}

export type Api = typeof api
contextBridge.exposeInMainWorld('api', api)
