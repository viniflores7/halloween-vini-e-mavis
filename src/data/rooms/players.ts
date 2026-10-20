import type { Player, Room } from './types'

export function playersInRoom(room: Room, players: Player[]) {
  const byId = new Map(players.map((player) => [player.id, player]))
  return room.playerIds.flatMap((id) => byId.get(id) ?? [])
}

export function findPlayer(players: Player[], id: string | null | undefined) {
  return players.find((player) => player.id === id) ?? null
}
