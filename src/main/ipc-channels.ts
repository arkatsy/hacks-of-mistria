import { parseHeader, parseInfo } from './parsers'
import { unpackedSavesPathsCache } from './utils'

// NOTE: When adding new channels make sure to add their return types to the `src/shared/index.ts`

export const ChannelNames = {
  'get/sorted-loading-saves': 'get/sorted-loading-saves'
}

export const channels = {
  [ChannelNames['get/sorted-loading-saves']]: handleGetSortedLoadingSaves
}

function handleGetSortedLoadingSaves(e: Electron.IpcMainEvent) {
  const unpackedSavesInfo = Array.from(unpackedSavesPathsCache.values())

  const sortedSavesByLastPlayed = unpackedSavesInfo
    .map((saveInfo) => {
      const infoData = parseInfo(saveInfo.jsonPaths.info)
      const headerData = parseHeader(saveInfo.jsonPaths.header)
      return {
        info: infoData,
        header: headerData,
        id: saveInfo.saveId,
        autosave: saveInfo.saveId.includes('autosave')
      }
    })
    .sort((a, b) => b.info.last_played - a.info.last_played)

  e.returnValue = sortedSavesByLastPlayed
}
