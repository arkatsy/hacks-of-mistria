import fs from 'fs'
import { execFileSync } from 'child_process'
import path from 'path'

const vaultcPath = path.join(__dirname, '..', '..', 'vaultc.exe')

export function readJsonFile<T>(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

export const vaultc = {
  packSave: (savefilePath: string, unpackDirPath: string) => {
    execFileSync(vaultcPath, ['pack', savefilePath, unpackDirPath])
  },
  unpackSave: (savefilePath: string, unpackDirPath: string) => {
    execFileSync(vaultcPath, ['unpack', savefilePath, unpackDirPath])
  }
}
