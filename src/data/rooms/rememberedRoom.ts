import { readStorage, writeStorage } from '@/shared/lib/storage'
import { normalizeRoomCode } from './roomCode'

const STORAGE_KEY = 'hvm-last-room'

export function rememberRoomCode(code: string) {
  writeStorage(STORAGE_KEY, normalizeRoomCode(code))
}

export function rememberedRoomCode() {
  return readStorage(STORAGE_KEY)
}
