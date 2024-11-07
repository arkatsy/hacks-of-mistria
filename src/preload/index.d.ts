import { ElectronAPI } from '@electron-toolkit/preload'
import { ParsedHeader } from '../main/index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getSaves: () => Array<ParsedHeader>
    }
  }
}
