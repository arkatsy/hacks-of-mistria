import { HeaderJson, InfoJson } from './jsons'

// 'get/sorted-loading-saves-ids'
export type SortedLoadingSaves = {
  header: HeaderJson
  info: InfoJson
  id: string
  autosave: boolean
}[]

export type Api = {
  getSortedLoadingSaves: () => SortedLoadingSaves
}
