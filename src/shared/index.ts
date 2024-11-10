import { HeaderJson, InfoJson } from './jsons'

// 'get/sorted-loading-saves-ids'
export type SortedLoadingSaveIds = string[]

// 'get/loading-save-info'
export type LoadingSaveInfo = {
  isAutosave: boolean
  fomSavePath: string
  saveId: string
} & InfoJson &
  HeaderJson

export type Api = {
  getSortedLoadingSavesIds: () => SortedLoadingSaveIds
  getLoadingSaveInfo: (saveId: string) => LoadingSaveInfo
}
