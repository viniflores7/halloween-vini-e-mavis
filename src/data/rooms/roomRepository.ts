import {
  advanceByClock,
  backToLobby,
  callMeeting,
  castVote,
  changeSettings,
  closeVoting,
  joinRoom,
  newRoom,
  removeFromRoom,
  startRound,
} from './gameRules'
import { newPlayer } from '@/data/realtime/players'
import { generateRoomCode } from '@/data/realtime/roomCode'
import type { LiveStore } from '@/data/realtime/types'
import type { Room, RoomRepository } from './types'

type Transition = (room: Room, playerId: string, now: number) => Room | null

export function createRoomRepository(store: LiveStore<Room>, random: () => number = Math.random): RoomRepository {
  async function change(code: string, transition: Transition) {
    const playerId = await store.playerId()
    await store.change(code, (room) => transition(room, playerId, store.now()))
  }

  return {
    playerId: () => store.playerId(),
    now: () => store.now(),
    exists: (code) => store.exists(code),
    watch: (code, onChange, onError) => store.watch(code, onChange, onError),

    async create() {
      const hostId = await store.playerId()
      for (;;) {
        const code = generateRoomCode()
        if (await store.create(newRoom(code, hostId, store.now()))) return code
      }
    },

    async join(code, profile) {
      const playerId = await store.playerId()
      await store.savePlayer(code, newPlayer(playerId, profile, store.now()))
      await store.change(code, (room) => joinRoom(room, playerId))
    },

    async leave(code) {
      const playerId = await store.playerId()
      await change(code, (room) => removeFromRoom(room, playerId, playerId))
      await store.removePlayer(code, playerId)
    },

    async kick(code, playerId) {
      await change(code, (room, actorId) => removeFromRoom(room, actorId, playerId))
      await store.removePlayer(code, playerId)
    },

    updateSettings: (code, settings) => change(code, (room, actorId) => changeSettings(room, actorId, settings)),
    startRound: (code) => change(code, (room, actorId, now) => startRound(room, actorId, now, random)),
    callMeeting: (code, kind, victimId) =>
      change(code, (room, actorId, now) => callMeeting(room, actorId, now, kind, victimId)),
    vote: (code, target) => change(code, (room, actorId, now) => castVote(room, actorId, now, target)),
    closeVoting: (code) => change(code, (room, actorId, now) => closeVoting(room, actorId, now)),
    advanceByClock: (code) => change(code, (room, _actorId, now) => advanceByClock(room, now)),
    backToLobby: (code) => change(code, (room, actorId) => backToLobby(room, actorId)),
  }
}
