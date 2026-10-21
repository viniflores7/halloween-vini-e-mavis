import { reachedTimeLimit } from './roundTimer'
import {
  GameRuleError,
  SKIP_VOTE,
  type MeetingKind,
  type Role,
  type Room,
  type RoomSettings,
  type Round,
  type RoundResult,
} from './types'

export const MAX_PLAYERS = 15
export const MIN_PLAYERS = 2
export const ROLE_REVEAL_MS = 7_000
export const MEETING_ALERT_MS = 4_000
export const OUTCOME_MS = 9_000

export const SETTINGS_LIMITS = {
  impostorCount: { min: 1, max: 3, step: 1 },
  emergencyMeetingsPerPlayer: { min: 0, max: 5, step: 1 },
  votingSeconds: { min: 30, max: 300, step: 15 },
} as const

export const DEFAULT_SETTINGS: RoomSettings = {
  impostorCount: 1,
  emergencyMeetingsPerPlayer: 1,
  votingSeconds: 120,
}

export function newRoom(code: string, hostId: string, now: number): Room {
  return {
    code,
    hostId,
    playerIds: [],
    status: 'lobby',
    settings: DEFAULT_SETTINGS,
    roundsPlayed: 0,
    round: null,
    meeting: null,
    lastOutcome: null,
    result: null,
    createdAt: now,
  }
}

export function maxImpostors(playerCount: number) {
  if (playerCount >= 9) return 3
  if (playerCount >= 7) return 2
  return 1
}

export const isHost = (room: Room, playerId: string) => room.hostId === playerId

export function roleOf(room: Room, playerId: string): Role | null {
  return room.round?.roles[playerId] ?? null
}

export function alivePlayerIds(room: Room) {
  const round = room.round
  if (!round) return room.playerIds
  return room.playerIds.filter((id) => id in round.roles && !round.dead.includes(id))
}

export const isAlive = (room: Room, playerId: string) => alivePlayerIds(room).includes(playerId)

export function impostorIds(room: Room) {
  return room.playerIds.filter((id) => roleOf(room, id) === 'impostor')
}

export function emergencyMeetingsLeft(room: Room, playerId: string) {
  const used = room.round?.emergencyCalls[playerId] ?? 0
  return Math.max(0, room.settings.emergencyMeetingsPerPlayer - used)
}

export function tallyVotes(votes: Record<string, string>) {
  const tally: Record<string, number> = {}
  for (const target of Object.values(votes)) tally[target] = (tally[target] ?? 0) + 1
  return tally
}

// Como no Among Us: empate, ou pular com tantos votos quanto o mais votado, não ejeta ninguém
export function pickEjected(tally: Record<string, number>) {
  const skipVotes = tally[SKIP_VOTE] ?? 0
  const ranking = Object.entries(tally)
    .filter(([target]) => target !== SKIP_VOTE)
    .sort(([, a], [, b]) => b - a)
  const [first, second] = ranking
  if (!first || first[1] <= skipVotes || (second && second[1] === first[1])) return null
  return first[0]
}

export function winnerBySurvivors(room: Room): RoundResult | null {
  const alive = alivePlayerIds(room)
  const impostorsAlive = alive.filter((id) => roleOf(room, id) === 'impostor').length
  if (impostorsAlive === 0) return { winner: 'crewmates', reason: 'impostorsEliminated' }
  if (impostorsAlive >= alive.length - impostorsAlive) return { winner: 'impostors', reason: 'impostorsOutnumber' }
  return null
}

export function joinRoom(room: Room, playerId: string): Room | null {
  if (room.playerIds.includes(playerId)) return null
  if (room.status !== 'lobby') throw new GameRuleError('gameInProgress')
  if (room.playerIds.length >= MAX_PLAYERS) throw new GameRuleError('roomFull')
  return { ...room, playerIds: [...room.playerIds, playerId] }
}

export function removeFromRoom(room: Room, actorId: string, playerId: string): Room | null {
  if (actorId !== playerId && !isHost(room, actorId)) throw new GameRuleError('notHost')
  if (!room.playerIds.includes(playerId)) return null
  if (room.status === 'playing' || room.status === 'meeting') throw new GameRuleError('gameInProgress')
  const playerIds = room.playerIds.filter((id) => id !== playerId)
  const hostId = isHost(room, playerId) && playerIds.length > 0 ? playerIds[0] : room.hostId
  return { ...room, playerIds, hostId }
}

export function changeSettings(room: Room, actorId: string, settings: RoomSettings): Room {
  if (!isHost(room, actorId)) throw new GameRuleError('notHost')
  const clamp = (key: keyof typeof SETTINGS_LIMITS) =>
    Math.min(SETTINGS_LIMITS[key].max, Math.max(SETTINGS_LIMITS[key].min, Math.round(settings[key])))
  return {
    ...room,
    settings: {
      impostorCount: clamp('impostorCount'),
      emergencyMeetingsPerPlayer: clamp('emergencyMeetingsPerPlayer'),
      votingSeconds: clamp('votingSeconds'),
    },
  }
}

function shuffle<T>(items: T[], random: () => number) {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function startRound(room: Room, actorId: string, now: number, random: () => number = Math.random): Room {
  if (!isHost(room, actorId)) throw new GameRuleError('notHost')
  if (room.status === 'playing' || room.status === 'meeting') throw new GameRuleError('gameInProgress')
  if (room.playerIds.length < MIN_PLAYERS) throw new GameRuleError('notEnoughPlayers')

  const impostorCount = Math.min(room.settings.impostorCount, maxImpostors(room.playerIds.length))
  const impostors = new Set(shuffle(room.playerIds, random).slice(0, impostorCount))
  const roles = Object.fromEntries(
    room.playerIds.map((id): [string, Role] => [id, impostors.has(id) ? 'impostor' : 'crewmate']),
  )
  const number = room.roundsPlayed + 1

  return {
    ...room,
    status: 'playing',
    roundsPlayed: number,
    round: {
      number,
      startsAt: now + ROLE_REVEAL_MS,
      pausedAt: null,
      pausedMs: 0,
      resumedAt: null,
      roles,
      dead: [],
      emergencyCalls: {},
    },
    meeting: null,
    lastOutcome: null,
    result: null,
  }
}

function playingRound(room: Room, now: number): Round {
  const round = room.round
  if (room.status !== 'playing' || !round || now < round.startsAt) throw new GameRuleError('notPlaying')
  if (round.resumedAt && now < round.resumedAt) throw new GameRuleError('notPlaying')
  if (reachedTimeLimit(round, now)) throw new GameRuleError('timeLimitReached')
  return round
}

function endRound(room: Room, result: RoundResult): Room {
  return { ...room, status: 'ended', meeting: null, result }
}

export function callMeeting(room: Room, actorId: string, now: number, kind: MeetingKind, victimId?: string): Room {
  const round = playingRound(room, now)
  if (!isAlive(room, actorId)) throw new GameRuleError('notAlive')
  if (kind === 'emergency' && emergencyMeetingsLeft(room, actorId) <= 0) throw new GameRuleError('noEmergencyLeft')
  if (kind === 'report' && (!victimId || victimId === actorId || !isAlive(room, victimId))) {
    throw new GameRuleError('invalidVictim')
  }

  const pausedRound: Round = {
    ...round,
    dead: kind === 'report' && victimId ? [...round.dead, victimId] : round.dead,
    emergencyCalls:
      kind === 'emergency'
        ? { ...round.emergencyCalls, [actorId]: (round.emergencyCalls[actorId] ?? 0) + 1 }
        : round.emergencyCalls,
    pausedAt: now,
    resumedAt: null,
  }
  const withDeath: Room = { ...room, round: pausedRound, lastOutcome: null }
  const result = winnerBySurvivors(withDeath)
  if (result) return endRound(withDeath, result)

  return {
    ...withDeath,
    status: 'meeting',
    meeting: {
      kind,
      calledBy: actorId,
      victimId: kind === 'report' ? (victimId ?? null) : null,
      calledAt: now,
      votingEndsAt: now + MEETING_ALERT_MS + room.settings.votingSeconds * 1000,
      votes: {},
    },
  }
}

function resolveMeeting(room: Room, now: number): Room {
  const { meeting, round } = room
  if (room.status !== 'meeting' || !meeting || !round) throw new GameRuleError('notInMeeting')

  const tally = tallyVotes(meeting.votes)
  const ejectedId = pickEjected(tally)
  const showUntil = now + OUTCOME_MS
  const resumed: Room = {
    ...room,
    status: 'playing',
    meeting: null,
    round: {
      ...round,
      dead: ejectedId ? [...round.dead, ejectedId] : round.dead,
      pausedAt: null,
      pausedMs: round.pausedMs + (showUntil - (round.pausedAt ?? now)),
      resumedAt: showUntil,
    },
    lastOutcome: {
      kind: meeting.kind,
      calledBy: meeting.calledBy,
      victimId: meeting.victimId,
      ejectedId,
      ejectedWasImpostor: ejectedId ? round.roles[ejectedId] === 'impostor' : null,
      tally,
      showUntil,
    },
  }
  const result = winnerBySurvivors(resumed)
  return result ? endRound(resumed, result) : resumed
}

export function castVote(room: Room, actorId: string, now: number, target: string): Room {
  const { meeting } = room
  if (room.status !== 'meeting' || !meeting) throw new GameRuleError('notInMeeting')
  if (!isAlive(room, actorId)) throw new GameRuleError('notAlive')
  if (actorId in meeting.votes) throw new GameRuleError('alreadyVoted')
  if (target !== SKIP_VOTE && !isAlive(room, target)) throw new GameRuleError('invalidVote')

  const voted: Room = { ...room, meeting: { ...meeting, votes: { ...meeting.votes, [actorId]: target } } }
  const everyoneVoted = alivePlayerIds(voted).every((id) => id in voted.meeting!.votes)
  return everyoneVoted || now >= meeting.votingEndsAt ? resolveMeeting(voted, now) : voted
}

export function closeVoting(room: Room, actorId: string, now: number): Room | null {
  if (room.status !== 'meeting' || !room.meeting) return null
  if (now < room.meeting.votingEndsAt && !isHost(room, actorId)) throw new GameRuleError('votingOpen')
  return resolveMeeting(room, now)
}

// Chamado por todos os celulares quando um prazo vence; só o primeiro efetivamente muda a sala
export function advanceByClock(room: Room, now: number): Room | null {
  const { round, meeting } = room
  if (room.status === 'meeting' && meeting && now >= meeting.votingEndsAt) return resolveMeeting(room, now)
  if (room.status === 'playing' && round && now >= round.startsAt && reachedTimeLimit(round, now)) {
    return endRound(room, { winner: null, reason: 'timeLimit' })
  }
  return null
}

export function backToLobby(room: Room, actorId: string): Room {
  if (!isHost(room, actorId)) throw new GameRuleError('notHost')
  return { ...room, status: 'lobby', round: null, meeting: null, lastOutcome: null, result: null }
}
