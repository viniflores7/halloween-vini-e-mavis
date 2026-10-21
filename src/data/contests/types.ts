import type { LiveSnapshot, PlayerProfile } from '@/data/realtime/types'

export type ContestStage =
  | 'lobby'
  | 'voting'
  | 'podium'
  | 'results'
  | 'duoSetup'
  | 'duoVoting'
  | 'duoPodium'
  | 'duoResults'

// O Firestore não aceita lista dentro de lista, então cada grupo vira um objeto
export interface ContestGroupDoc {
  members: string[]
}

export interface Contest {
  code: string
  hostId: string
  playerIds: string[]
  stage: ContestStage
  stageAt: number
  participants: string[]
  ballots: Record<string, string[]>
  closedAt: number | null
  revealPlace: number
  groups: ContestGroupDoc[]
  groupBallots: Record<string, number>
  groupsClosedAt: number | null
  createdAt: number
}

export interface ContestRepository {
  playerId(): Promise<string>
  now(): number
  create(): Promise<string>
  exists(code: string): Promise<boolean>
  watch(
    code: string,
    onChange: (snapshot: LiveSnapshot<Contest>) => void,
    onError: (error: unknown) => void,
  ): () => void
  join(code: string, profile: PlayerProfile): Promise<void>
  leave(code: string): Promise<void>
  kick(code: string, playerId: string): Promise<void>
  startVoting(code: string): Promise<void>
  vote(code: string, picks: string[]): Promise<void>
  closeVoting(code: string): Promise<void>
  nextReveal(code: string): Promise<void>
  startGroupContest(code: string): Promise<void>
  setGroups(code: string, groups: string[][]): Promise<void>
  voteGroup(code: string, groupIndex: number): Promise<void>
  closeGroupVoting(code: string): Promise<void>
}

export type ContestRuleViolation =
  | 'notHost'
  | 'contestStarted'
  | 'contestFull'
  | 'notEnoughParticipants'
  | 'notEnoughForGroups'
  | 'notVoting'
  | 'notParticipant'
  | 'alreadyVoted'
  | 'invalidBallot'
  | 'noVotes'
  | 'notRevealing'
  | 'notInResults'
  | 'invalidGroups'

export class ContestRuleError extends Error {
  constructor(readonly violation: ContestRuleViolation) {
    super(violation)
  }
}
