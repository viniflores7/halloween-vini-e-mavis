import { readStorage, writeStorage } from '@/shared/lib/storage'
import type { Player } from '@/data/realtime/types'

// Modo demonstração: sem Firebase, as salas ficam no localStorage e as abas do mesmo navegador jogam juntas
const STORAGE_KEY = 'hvm-demo-db-v2'

export interface DemoCollection {
  docs: Record<string, unknown>
  players: Record<string, Record<string, Player>>
}

export type DemoDatabase = Record<string, DemoCollection>

type Listener = () => void

const listeners = new Set<Listener>()
let memory: string | null = null

export function readDemoCollection(name: string): DemoCollection {
  const stored = readStorage(STORAGE_KEY) ?? memory
  const database = stored ? (JSON.parse(stored) as DemoDatabase) : {}
  return database[name] ?? { docs: {}, players: {} }
}

export function writeDemoCollection(name: string, collection: DemoCollection) {
  const stored = readStorage(STORAGE_KEY) ?? memory
  const database = stored ? (JSON.parse(stored) as DemoDatabase) : {}
  memory = JSON.stringify({ ...database, [name]: collection })
  writeStorage(STORAGE_KEY, memory)
  listeners.forEach((listener) => listener())
}

export function onDemoDatabaseChange(listener: Listener) {
  const onStorage = (event: StorageEvent) => event.key === STORAGE_KEY && listener()
  listeners.add(listener)
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

export function resetDemoDatabase() {
  memory = null
}
