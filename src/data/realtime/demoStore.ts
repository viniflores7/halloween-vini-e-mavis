import { onDemoDatabaseChange, readDemoCollection, writeDemoCollection } from '@/data/demo/demoDatabase'
import { readSessionStorage, writeSessionStorage } from '@/shared/lib/storage'
import { DocNotFoundError, type LiveStore } from './types'

const PLAYER_ID_KEY = 'hvm-demo-player-id'

// Cada aba é um jogador diferente, para dar para testar a partida abrindo várias abas
function tabPlayerId() {
  const stored = readSessionStorage(PLAYER_ID_KEY)
  if (stored) return stored
  const created = crypto.randomUUID()
  writeSessionStorage(PLAYER_ID_KEY, created)
  return created
}

export function createDemoStore<T extends { code: string }>(collectionName: string): LiveStore<T> {
  const playerId = tabPlayerId()
  const read = () => readDemoCollection(collectionName)
  const write = (collection: ReturnType<typeof read>) => writeDemoCollection(collectionName, collection)

  return {
    async playerId() {
      return playerId
    },

    now: () => Date.now(),

    async create(doc) {
      const collection = read()
      if (collection.docs[doc.code]) return false
      collection.docs[doc.code] = doc
      write(collection)
      return true
    },

    async change(code, change) {
      const collection = read()
      const doc = collection.docs[code] as T | undefined
      if (!doc) throw new DocNotFoundError(code)
      const next = change(doc)
      if (!next) return
      collection.docs[code] = next
      write(collection)
    },

    async exists(code) {
      return Boolean(read().docs[code])
    },

    async savePlayer(code, player) {
      const collection = read()
      collection.players[code] = { ...collection.players[code], [player.id]: player }
      write(collection)
    },

    async removePlayer(code, id) {
      const collection = read()
      delete collection.players[code]?.[id]
      write(collection)
    },

    watch(code, onChange) {
      const emit = () => {
        const collection = read()
        onChange({
          doc: (collection.docs[code] as T | undefined) ?? null,
          players: Object.values(collection.players[code] ?? {}),
        })
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
