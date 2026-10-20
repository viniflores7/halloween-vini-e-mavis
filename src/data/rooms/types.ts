export type RoomStatus = 'lobby' | 'playing' | 'meeting' | 'ended'
export type Role = 'impostor' | 'crewmate'
export type Team = 'crewmates' | 'impostors'
export type MeetingKind = 'emergency' | 'report'
export type EndReason = 'impostorsEliminated' | 'impostorsOutnumber' | 'timeLimit'

export const SKIP_VOTE = 'skip'

export interface RoomSettings {
  impostorCount: number
  emergencyMeetingsPerPlayer: number
  votingSeconds: number
}

export interface Round {
  number: number
  startsAt: number
  pausedAt: number | null
  pausedMs: number
  resumedAt: number | null
  roles: Record<string, Role>
  dead: string[]
  emergencyCalls: Record<string, number>
}

export interface Meeting {
  kind: MeetingKind
  calledBy: string
  victimId: string | null
  calledAt: number
  votingEndsAt: number
  votes: Record<string, string>
}

export interface MeetingOutcome {
  kind: MeetingKind
  calledBy: string
  victimId: string | null
  ejectedId: string | null
  ejectedWasImpostor: boolean | null
  tally: Record<string, number>
  showUntil: number
}

export interface RoundResult {
  winner: Team | null
  reason: EndReason
}

export interface Room {
  code: string
  hostId: string
  playerIds: string[]
  status: RoomStatus
  settings: RoomSettings
  roundsPlayed: number
  round: Round | null
  meeting: Meeting | null
  lastOutcome: MeetingOutcome | null
  result: RoundResult | null
  createdAt: number
}

export interface PlayerProfile {
  name: string
  photo: string
}

export interface Player extends PlayerProfile {
  id: string
  joinedAt: number
}

export interface RoomSnapshot {
  room: Room | null
  players: Player[]
}

export type RoomChange = (room: Room) => Room | null

export interface RoomStore {
  playerId(): Promise<string>
  now(): number
  createRoom(room: Room): Promise<boolean>
  changeRoom(code: string, change: RoomChange): Promise<void>
  roomExists(code: string): Promise<boolean>
  savePlayer(code: string, player: Player): Promise<void>
  removePlayer(code: string, playerId: string): Promise<void>
  watch(code: string, onChange: (snapshot: RoomSnapshot) => void, onError: (error: unknown) => void): () => void
}

export interface RoomRepository {
  playerId(): Promise<string>
  now(): number
  create(): Promise<string>
  exists(code: string): Promise<boolean>
  watch(code: string, onChange: (snapshot: RoomSnapshot) => void, onError: (error: unknown) => void): () => void
  join(code: string, profile: PlayerProfile): Promise<void>
  leave(code: string): Promise<void>
  kick(code: string, playerId: string): Promise<void>
  updateSettings(code: string, settings: RoomSettings): Promise<void>
  startRound(code: string): Promise<void>
  callMeeting(code: string, kind: MeetingKind, victimId?: string): Promise<void>
  vote(code: string, target: string): Promise<void>
  closeVoting(code: string): Promise<void>
  advanceByClock(code: string): Promise<void>
  backToLobby(code: string): Promise<void>
}

export type GameRuleViolation =
  | 'gameInProgress'
  | 'roomFull'
  | 'notHost'
  | 'notEnoughPlayers'
  | 'notPlaying'
  | 'notAlive'
  | 'invalidVictim'
  | 'noEmergencyLeft'
  | 'timeLimitReached'
  | 'notInMeeting'
  | 'alreadyVoted'
  | 'invalidVote'
  | 'votingOpen'

export class GameRuleError extends Error {
  constructor(readonly violation: GameRuleViolation) {
    super(violation)
  }
}

export class RoomNotFoundError extends Error {
  constructor(code: string) {
    super(`Sala ${code} não existe`)
  }
}
