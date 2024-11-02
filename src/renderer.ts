import type {API} from './preload'

declare global {
  interface Window {
    api: API
  }
}

console.log("Hello World2")
