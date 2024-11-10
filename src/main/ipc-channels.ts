import { parseInfo } from './parsers'
import { unpackedSavesPathsCache } from './utils'

// NOTE: When adding new channels make sure to add their return types to the `src/shared/index.ts`

export const ChannelNames = {
  'get/sorted-loading-saves-ids': 'get/sorted-loading-saves-ids',
  'get/loading-save-info': 'get/loading-save-info'
}

export const channels = {
  [ChannelNames['get/sorted-loading-saves-ids']]: handleGetSortedLoadingSaveIds,
  [ChannelNames['get/loading-save-info']]: handleGetLoadingSaveInfo
}

function handleGetSortedLoadingSaveIds(e: Electron.IpcMainEvent) {
  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())

  const sortedSaveIdsByLastPlayed = unpackedSavesInfo
    .map((saveInfo) => {
      const infoData = parseInfo(saveInfo.jsonPaths.info)
      return {
        id: saveInfo.saveId,
        last_played: infoData.last_played
      }
    })
    .sort((a, b) => b.last_played - a.last_played)
    .map((saveInfo) => saveInfo.id)

  e.returnValue = sortedSaveIdsByLastPlayed
}

function handleGetLoadingSaveInfo(e: Electron.IpcMainEvent, saveId: string) {
  const saveInfo = unpackedSavesPathsCache.get(saveId)

  if (!saveInfo) {
    e.returnValue = null
    return
  }

  const infoData = parseInfo(saveInfo.jsonPaths.info)
  const headerData = parseInfo(saveInfo.jsonPaths.header)

  const isAutosave = saveId.includes('autosave')

  e.returnValue = {
    isAutosave,
    saveId,
    fomSavePath: saveInfo.fomSavePath,
    ...infoData,
    ...headerData
  }
}
