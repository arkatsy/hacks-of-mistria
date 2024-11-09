import { ElectronAPI } from '@electron-toolkit/preload'
import { ParsedSave } from '../main/index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getSaves: () => Array<ParsedSave>
    }
  }
}
