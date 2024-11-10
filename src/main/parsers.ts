import { InfoJson, HeaderJson } from '../shared/jsons'
import { readJsonFile } from './utils'

// NOTE: If a parser doesn't return a json type like `HeaderJson` or `InfoJson`, make sure to add it to the `src/shared/parsers.ts`

export function parseInfo(unpackedPath: string) {
  return readJsonFile<InfoJson>(unpackedPath)
}

export function parseHeader(unpackedPath: string) {
  return readJsonFile<HeaderJson>(unpackedPath)
}
