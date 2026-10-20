import { onDemoDatabaseChange, readDemoDatabase, writeDemoDatabase } from '@/data/demo/demoDatabase'
import { readSessionStorage, writeSessionStorage } from '@/shared/lib/storage'
import { RoomNotFoundError, type RoomStore } from './types'

const PLAYER_ID_KEY = 'hvm-demo-player-id'

// Cada aba é um jogador diferente, para dar para testar a partida abrindo várias abas
function tabPlayerId() {
  const stored = readSessionStorage(PLAYER_ID_KEY)
  if (stored) return stored
  const created = crypto.randomUUID()
  writeSessionStorage(PLAYER_ID_KEY, created)
  return created
}

export function createDemoRoomStore(): RoomStore {
  const playerId = tabPlayerId()

  return {
    async playerId() {
      return playerId
    },

    now: () => Date.now(),

    async createRoom(room) {
      const database = readDemoDatabase()
      if (database.rooms[room.code]) return false
      database.rooms[room.code] = room
      writeDemoDatabase(database)
      return true
    },

    async changeRoom(code, change) {
      const database = readDemoDatabase()
      const room = database.rooms[code]
      if (!room) throw new RoomNotFoundError(code)
      const next = change(room)
      if (!next) return
      database.rooms[code] = next
      writeDemoDatabase(database)
    },

    async roomExists(code) {
      return Boolean(readDemoDatabase().rooms[code])
    },

    async savePlayer(code, player) {
      const database = readDemoDatabase()
      database.players[code] = { ...database.players[code], [player.id]: player }
      writeDemoDatabase(database)
    },

    async removePlayer(code, id) {
      const database = readDemoDatabase()
      delete database.players[code]?.[id]
      writeDemoDatabase(database)
    },

    watch(code, onChange) {
      const emit = () => {
        const database = readDemoDatabase()
        onChange({ room: database.rooms[code] ?? null, players: Object.values(database.players[code] ?? {}) })
      }
      const timeout = setTimeout(emit)
      const stop = onDemoDatabaseChange(emit)
      return () => {
        clearTimeout(timeout)
        stop()
      }
    },
  }
}
