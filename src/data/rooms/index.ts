import { lazyRepository } from '../lazyRepository'
import { createRoomRepository } from './roomRepository'
import type { RoomRepository } from './types'

export const getRoomRepository = lazyRepository<RoomRepository>(
  () => import('./firestoreRoomStore').then((m) => createRoomRepository(m.createFirestoreRoomStore())),
  () => import('./demoRoomStore').then((m) => createRoomRepository(m.createDemoRoomStore())),
)

export * from './gameRules'
export * from './roomCode'
export * from './players'
export * from './rememberedRoom'
export * from './roundTimer'
export { MAX_NAME_LENGTH } from './roomRepository'
export { GameRuleError, RoomNotFoundError, SKIP_VOTE } from './types'
export type * from './types'
