import { readStorage, writeStorage } from '@/shared/lib/storage'
import type { Player, Room } from '@/data/rooms/types'

// Modo demonstração: sem Firebase, as salas ficam no localStorage e as abas do mesmo navegador jogam juntas
const STORAGE_KEY = 'hvm-demo-db'

export interface DemoDatabase {
  rooms: Record<string, Room>
  players: Record<string, Record<string, Player>>
}

type Listener = () => void

const listeners = new Set<Listener>()
let memory: string | null = null

export function readDemoDatabase(): DemoDatabase {
  const stored = readStorage(STORAGE_KEY) ?? memory
  return stored ? (JSON.parse(stored) as DemoDatabase) : { rooms: {}, players: {} }
}

export function writeDemoDatabase(database: DemoDatabase) {
  memory = JSON.stringify(database)
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
