import { lazyRepository } from '../lazyRepository'
import { createRoomRepository } from './roomRepository'
import type { Room, RoomRepository } from './types'

export const getRoomRepository = lazyRepository<RoomRepository>(
  () => import('../realtime/firestoreStore').then((m) => createRoomRepository(m.createFirestoreStore<Room>('rooms'))),
  () => import('../realtime/demoStore').then((m) => createRoomRepository(m.createDemoStore<Room>('rooms'))),
)

export * from './gameRules'
export * from './roundTimer'
export { GameRuleError, SKIP_VOTE } from './types'
export type * from './types'
