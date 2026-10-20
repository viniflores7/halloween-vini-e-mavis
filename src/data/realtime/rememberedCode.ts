import { readStorage, writeStorage } from '@/shared/lib/storage'
import { normalizeRoomCode } from './roomCode'

export type RoomKind = 'amongUs' | 'contest'

const storageKey = (kind: RoomKind) => `hvm-last-${kind}`

export function rememberRoomCode(kind: RoomKind, code: string) {
  writeStorage(storageKey(kind), normalizeRoomCode(code))
}

export function rememberedRoomCode(kind: RoomKind) {
  return readStorage(storageKey(kind))
}
