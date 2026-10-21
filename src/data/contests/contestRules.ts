import { podiumSize, rankCostumes, rankGroups } from './ranking'
import { ContestRuleError, type Contest } from './types'

export const MAX_PARTICIPANTS = 40
export const MIN_PARTICIPANTS = 2
export const BALLOT_SIZE = 3
export const MIN_GROUP_SIZE = 2
export const MAX_GROUP_SIZE = 3

// Ninguém vota em si mesmo: com 2 pessoas só dá para escolher o 1º lugar, com 3 o 1º e o 2º
export const ballotSize = (participantCount: number) => Math.min(BALLOT_SIZE, Math.max(0, participantCount - 1))

export const canStartGroupContest = (contest: Contest) => contest.participants.length >= MIN_GROUP_SIZE * 2

export function newContest(code: string, hostId: string, now: number): Contest {
  return {
    code,
    hostId,
    playerIds: [],
    stage: 'lobby',
    stageAt: now,
    participants: [],
    ballots: {},
    closedAt: null,
    revealPlace: 0,
    groups: [],
    groupBallots: {},
    groupsClosedAt: null,
    createdAt: now,
  }
}

export const isContestHost = (contest: Contest, playerId: string) => contest.hostId === playerId

function assertHost(contest: Contest, actorId: string) {
  if (!isContestHost(contest, actorId)) throw new ContestRuleError('notHost')
}

export function groupOf(contest: Contest, playerId: string) {
  return contest.groups.findIndex((group) => group.members.includes(playerId))
}

export function votableGroups(contest: Contest, voterId: string) {
  const own = groupOf(contest, voterId)
  return contest.groups.map((_, index) => index).filter((index) => index !== own)
}

export const groupVoters = (contest: Contest) =>
  contest.participants.filter((id) => votableGroups(contest, id).length > 0)

export const missingVoters = (contest: Contest) => contest.participants.filter((id) => !(id in contest.ballots))

export const missingGroupVoters = (contest: Contest) =>
  groupVoters(contest).filter((id) => !(id in contest.groupBallots))

export function joinContest(contest: Contest, playerId: string): Contest | null {
  if (contest.playerIds.includes(playerId)) return null
  if (contest.stage !== 'lobby') throw new ContestRuleError('contestStarted')
  if (contest.playerIds.length >= MAX_PARTICIPANTS) throw new ContestRuleError('contestFull')
  return { ...contest, playerIds: [...contest.playerIds, playerId] }
}

export function removeFromContest(contest: Contest, actorId: string, playerId: string): Contest | null {
  if (actorId !== playerId) assertHost(contest, actorId)
  if (!contest.playerIds.includes(playerId)) return null
  if (contest.stage !== 'lobby') throw new ContestRuleError('contestStarted')
  const playerIds = contest.playerIds.filter((id) => id !== playerId)
  const hostId = isContestHost(contest, playerId) && playerIds.length > 0 ? playerIds[0] : contest.hostId
  return { ...contest, playerIds, hostId }
}

export function startVoting(contest: Contest, actorId: string, now: number): Contest {
  assertHost(contest, actorId)
  if (contest.stage !== 'lobby') throw new ContestRuleError('contestStarted')
  if (contest.playerIds.length < MIN_PARTICIPANTS) throw new ContestRuleError('notEnoughParticipants')
  return { ...contest, stage: 'voting', stageAt: now, participants: contest.playerIds, ballots: {} }
}

function closeCostumeVoting(contest: Contest, now: number): Contest {
  const scores = rankCostumes(contest.participants, contest.ballots)
  return { ...contest, stage: 'podium', stageAt: now, closedAt: now, revealPlace: podiumSize(scores) }
}

export function castBallot(contest: Contest, actorId: string, now: number, picks: string[]): Contest {
  if (contest.stage !== 'voting') throw new ContestRuleError('notVoting')
  if (!contest.participants.includes(actorId)) throw new ContestRuleError('notParticipant')
  if (actorId in contest.ballots) throw new ContestRuleError('alreadyVoted')
  const size = ballotSize(contest.participants.length)
  const valid =
    picks.length === size &&
    new Set(picks).size === size &&
    picks.every((id) => id !== actorId && contest.participants.includes(id))
  if (!valid) throw new ContestRuleError('invalidBallot')

  const voted = { ...contest, ballots: { ...contest.ballots, [actorId]: picks } }
  return missingVoters(voted).length === 0 ? closeCostumeVoting(voted, now) : voted
}

export function closeVoting(contest: Contest, actorId: string, now: number): Contest {
  assertHost(contest, actorId)
  if (contest.stage !== 'voting') throw new ContestRuleError('notVoting')
  if (Object.keys(contest.ballots).length === 0) throw new ContestRuleError('noVotes')
  return closeCostumeVoting(contest, now)
}

export function nextReveal(contest: Contest, actorId: string, now: number): Contest {
  assertHost(contest, actorId)
  if (contest.stage === 'podium' && contest.revealPlace > 1) {
    return { ...contest, revealPlace: contest.revealPlace - 1, stageAt: now }
  }
  if (contest.stage === 'podium') return { ...contest, stage: 'results', stageAt: now }
  if (contest.stage === 'duoPodium') return { ...contest, stage: 'duoResults', stageAt: now }
  throw new ContestRuleError('notRevealing')
}

export function startGroupContest(contest: Contest, actorId: string, now: number): Contest {
  assertHost(contest, actorId)
  if (contest.stage !== 'results') throw new ContestRuleError('notInResults')
  if (!canStartGroupContest(contest)) throw new ContestRuleError('notEnoughForGroups')
  return { ...contest, stage: 'duoSetup', stageAt: now, groups: [], groupBallots: {} }
}

export function setGroups(contest: Contest, actorId: string, now: number, groups: string[][]): Contest {
  assertHost(contest, actorId)
  if (contest.stage !== 'duoSetup') throw new ContestRuleError('notInResults')
  const members = groups.flat()
  const valid =
    groups.length >= 2 &&
    groups.every((group) => group.length >= MIN_GROUP_SIZE && group.length <= MAX_GROUP_SIZE) &&
    new Set(members).size === members.length &&
    members.every((id) => contest.participants.includes(id))
  if (!valid) throw new ContestRuleError('invalidGroups')
  return {
    ...contest,
    stage: 'duoVoting',
    stageAt: now,
    groups: groups.map((members) => ({ members })),
    groupBallots: {},
  }
}

function closeGroups(contest: Contest, now: number): Contest {
  return { ...contest, stage: 'duoPodium', stageAt: now, groupsClosedAt: now, revealPlace: 1 }
}

export function castGroupBallot(contest: Contest, actorId: string, now: number, groupIndex: number): Contest {
  if (contest.stage !== 'duoVoting') throw new ContestRuleError('notVoting')
  if (!contest.participants.includes(actorId)) throw new ContestRuleError('notParticipant')
  if (actorId in contest.groupBallots) throw new ContestRuleError('alreadyVoted')
  if (!votableGroups(contest, actorId).includes(groupIndex)) throw new ContestRuleError('invalidBallot')

  const voted = { ...contest, groupBallots: { ...contest.groupBallots, [actorId]: groupIndex } }
  return missingGroupVoters(voted).length === 0 ? closeGroups(voted, now) : voted
}

export function closeGroupVoting(contest: Contest, actorId: string, now: number): Contest {
  assertHost(contest, actorId)
  if (contest.stage !== 'duoVoting') throw new ContestRuleError('notVoting')
  if (Object.keys(contest.groupBallots).length === 0) throw new ContestRuleError('noVotes')
  return closeGroups(contest, now)
}

export const costumeRanking = (contest: Contest) => rankCostumes(contest.participants, contest.ballots)
export const groupRanking = (contest: Contest) => rankGroups(contest.groups.length, contest.groupBallots)
