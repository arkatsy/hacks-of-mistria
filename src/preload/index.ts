import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getSaves: () => {
    return ipcRenderer.sendSync('get-saves')
  }
}

// we expose the api to the `window` object
// example usage: `window.api.getSaves()`
contextBridge.exposeInMainWorld('api', api)
