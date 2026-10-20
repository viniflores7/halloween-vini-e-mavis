export interface PlayerProfile {
  name: string
  photo: string
}

export interface Player extends PlayerProfile {
  id: string
  joinedAt: number
}

export interface LiveSnapshot<T> {
  doc: T | null
  players: Player[]
}

export type DocChange<T> = (doc: T) => T | null

// Uma sala com código (Among Us ou concurso): o documento principal e a lista de jogadores com foto
export interface LiveStore<T extends { code: string }> {
  playerId(): Promise<string>
  now(): number
  create(doc: T): Promise<boolean>
  change(code: string, change: DocChange<T>): Promise<void>
  exists(code: string): Promise<boolean>
  savePlayer(code: string, player: Player): Promise<void>
  removePlayer(code: string, playerId: string): Promise<void>
  watch(code: string, onChange: (snapshot: LiveSnapshot<T>) => void, onError: (error: unknown) => void): () => void
}

export class DocNotFoundError extends Error {
  constructor(code: string) {
    super(`Sala ${code} não existe`)
  }
}
