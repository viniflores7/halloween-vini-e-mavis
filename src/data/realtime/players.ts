import type { Player } from './types'

export const MAX_NAME_LENGTH = 24

export function playersInOrder(playerIds: string[], players: Player[]) {
  const byId = new Map(players.map((player) => [player.id, player]))
  return playerIds.flatMap((id) => byId.get(id) ?? [])
}

export function findPlayer(players: Player[], id: string | null | undefined) {
  return players.find((player) => player.id === id) ?? null
}

export function newPlayer(id: string, profile: { name: string; photo: string }, joinedAt: number): Player {
  return { id, name: profile.name.trim().slice(0, MAX_NAME_LENGTH), photo: profile.photo, joinedAt }
}
