import { newPlayer } from '@/data/realtime/players'
import { generateRoomCode } from '@/data/realtime/roomCode'
import type { LiveStore } from '@/data/realtime/types'
import {
  castBallot,
  castGroupBallot,
  closeGroupVoting,
  closeVoting,
  joinContest,
  newContest,
  nextReveal,
  removeFromContest,
  setGroups,
  startGroupContest,
  startVoting,
} from './contestRules'
import type { Contest, ContestRepository } from './types'

type Transition = (contest: Contest, playerId: string, now: number) => Contest | null

export function createContestRepository(store: LiveStore<Contest>): ContestRepository {
  async function change(code: string, transition: Transition) {
    const playerId = await store.playerId()
    await store.change(code, (contest) => transition(contest, playerId, store.now()))
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
        if (await store.create(newContest(code, hostId, store.now()))) return code
      }
    },

    async join(code, profile) {
      const playerId = await store.playerId()
      await store.savePlayer(code, newPlayer(playerId, profile, store.now()))
      await store.change(code, (contest) => joinContest(contest, playerId))
    },

    async leave(code) {
      const playerId = await store.playerId()
      await change(code, (contest) => removeFromContest(contest, playerId, playerId))
      await store.removePlayer(code, playerId)
    },

    async kick(code, playerId) {
      await change(code, (contest, actorId) => removeFromContest(contest, actorId, playerId))
      await store.removePlayer(code, playerId)
    },

    startVoting: (code) => change(code, (contest, actorId, now) => startVoting(contest, actorId, now)),
    vote: (code, picks) => change(code, (contest, actorId, now) => castBallot(contest, actorId, now, picks)),
    closeVoting: (code) => change(code, (contest, actorId, now) => closeVoting(contest, actorId, now)),
    nextReveal: (code) => change(code, (contest, actorId, now) => nextReveal(contest, actorId, now)),
    startGroupContest: (code) => change(code, (contest, actorId, now) => startGroupContest(contest, actorId, now)),
    setGroups: (code, groups) => change(code, (contest, actorId, now) => setGroups(contest, actorId, now, groups)),
    voteGroup: (code, groupIndex) =>
      change(code, (contest, actorId, now) => castGroupBallot(contest, actorId, now, groupIndex)),
    closeGroupVoting: (code) => change(code, (contest, actorId, now) => closeGroupVoting(contest, actorId, now)),
  }
}
