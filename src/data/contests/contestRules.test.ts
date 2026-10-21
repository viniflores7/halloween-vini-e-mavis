import { describe, expect, it } from 'vitest'
import {
  ballotSize,
  canStartGroupContest,
  castBallot,
  castGroupBallot,
  closeGroupVoting,
  closeVoting,
  costumeRanking,
  groupRanking,
  joinContest,
  MAX_PARTICIPANTS,
  missingGroupVoters,
  missingVoters,
  newContest,
  nextReveal,
  removeFromContest,
  setGroups,
  startGroupContest,
  startVoting,
} from './contestRules'
import { ContestRuleError, type Contest } from './types'

const NOW = 1_000_000
const people = ['ana', 'bia', 'caio', 'duda', 'enzo']

function lobbyWith(ids = people): Contest {
  return ids.reduce((contest, id) => joinContest(contest, id) ?? contest, newContest('FANT', ids[0], NOW))
}

const votingWith = (ids = people) => startVoting(lobbyWith(ids), ids[0], NOW)

const violation = (run: () => unknown) => {
  try {
    run()
  } catch (error) {
    return (error as ContestRuleError).violation
  }
  return null
}

function voteAll(contest: Contest, ballots: Record<string, string[]>) {
  return Object.entries(ballots).reduce((current, [voter, picks]) => castBallot(current, voter, NOW, picks), contest)
}

describe('entrada', () => {
  it('aceita até 40 participantes e só antes de começar', () => {
    const full = lobbyWith(Array.from({ length: MAX_PARTICIPANTS }, (_, i) => `p${i}`))
    expect(violation(() => joinContest(full, 'atrasado'))).toBe('contestFull')
    expect(violation(() => joinContest(votingWith(), 'atrasado'))).toBe('contestStarted')
  })

  it('só o anfitrião remove outras pessoas', () => {
    expect(violation(() => removeFromContest(lobbyWith(), 'bia', 'caio'))).toBe('notHost')
    expect(removeFromContest(lobbyWith(), 'ana', 'caio')!.playerIds).not.toContain('caio')
  })
})

describe('início', () => {
  it('só o anfitrião começa e precisa de pelo menos 2 pessoas', () => {
    expect(violation(() => startVoting(lobbyWith(), 'bia', NOW))).toBe('notHost')
    expect(violation(() => startVoting(lobbyWith(['ana']), 'ana', NOW))).toBe('notEnoughParticipants')
    expect(votingWith()).toMatchObject({ stage: 'voting', participants: people })
  })
})

describe('votação individual', () => {
  it('exige 1º, 2º e 3º diferentes e não deixa votar em si mesmo', () => {
    const contest = votingWith()
    expect(violation(() => castBallot(contest, 'ana', NOW, ['ana', 'bia', 'caio']))).toBe('invalidBallot')
    expect(violation(() => castBallot(contest, 'ana', NOW, ['bia', 'bia', 'caio']))).toBe('invalidBallot')
    expect(violation(() => castBallot(contest, 'ana', NOW, ['bia', 'caio']))).toBe('invalidBallot')
    expect(violation(() => castBallot(contest, 'ana', NOW, ['bia', 'caio', 'zeca']))).toBe('invalidBallot')
  })

  it('não aceita voto duplicado e lista quem falta votar', () => {
    const contest = castBallot(votingWith(), 'ana', NOW, ['bia', 'caio', 'duda'])
    expect(violation(() => castBallot(contest, 'ana', NOW, ['bia', 'caio', 'duda']))).toBe('alreadyVoted')
    expect(missingVoters(contest)).toEqual(['bia', 'caio', 'duda', 'enzo'])
  })

  it('vai para a apuração quando todos votam, começando pelo 3º lugar', () => {
    const contest = voteAll(votingWith(), {
      ana: ['bia', 'caio', 'duda'],
      bia: ['caio', 'duda', 'enzo'],
      caio: ['bia', 'duda', 'enzo'],
      duda: ['bia', 'caio', 'enzo'],
      enzo: ['bia', 'caio', 'duda'],
    })
    expect(contest).toMatchObject({ stage: 'podium', revealPlace: 3, closedAt: NOW })
    expect(costumeRanking(contest).map(({ playerId, points, place }) => [playerId, points, place])).toEqual([
      ['bia', 12, 1],
      ['caio', 9, 2],
      ['duda', 6, 3],
      ['enzo', 3, 4],
    ])
  })

  it('o anfitrião pode apurar sem esperar quem falta', () => {
    const contest = castBallot(votingWith(), 'bia', NOW, ['ana', 'caio', 'duda'])
    expect(violation(() => closeVoting(votingWith(), 'ana', NOW))).toBe('noVotes')
    expect(violation(() => closeVoting(contest, 'bia', NOW))).toBe('notHost')
    expect(closeVoting(contest, 'ana', NOW).stage).toBe('podium')
  })

  it('revela do 3º para o 1º e depois mostra os resultados', () => {
    const podium = closeVoting(castBallot(votingWith(), 'bia', NOW, ['ana', 'caio', 'duda']), 'ana', NOW)
    const second = nextReveal(podium, 'ana', NOW + 1)
    const first = nextReveal(second, 'ana', NOW + 2)
    expect([podium.revealPlace, second.revealPlace, first.revealPlace]).toEqual([3, 2, 1])
    expect(nextReveal(first, 'ana', NOW + 3).stage).toBe('results')
    expect(violation(() => nextReveal(podium, 'bia', NOW))).toBe('notHost')
  })
})

describe('salas pequenas', () => {
  it('com 2 pessoas cada uma vota só no 1º lugar e as duas empatam', () => {
    const contest = votingWith(['ana', 'bia'])
    expect(ballotSize(2)).toBe(1)
    expect(violation(() => castBallot(contest, 'ana', NOW, ['bia', 'ana']))).toBe('invalidBallot')
    const podium = voteAll(contest, { ana: ['bia'], bia: ['ana'] })
    expect(podium).toMatchObject({ stage: 'podium', revealPlace: 1 })
    expect(costumeRanking(podium).map((score) => score.place)).toEqual([1, 1])
    expect(nextReveal(podium, 'ana', NOW).stage).toBe('results')
  })

  it('com 3 pessoas vota no 1º e no 2º lugar', () => {
    const contest = voteAll(votingWith(['ana', 'bia', 'caio']), {
      ana: ['bia', 'caio'],
      bia: ['caio', 'ana'],
      caio: ['bia', 'ana'],
    })
    expect(ballotSize(3)).toBe(2)
    expect(costumeRanking(contest).map(({ playerId, points }) => [playerId, points])).toEqual([
      ['bia', 6],
      ['caio', 5],
      ['ana', 4],
    ])
  })

  it('a fantasia em dupla só aparece com pelo menos 4 pessoas', () => {
    const results = nextReveal(voteAll(votingWith(['ana', 'bia']), { ana: ['bia'], bia: ['ana'] }), 'ana', NOW)
    expect(canStartGroupContest(results)).toBe(false)
    expect(violation(() => startGroupContest(results, 'ana', NOW))).toBe('notEnoughForGroups')
  })
})

describe('ranking', () => {
  it('desempata pelos votos de 1º lugar e divide o lugar quando continua empatado', () => {
    const contest = voteAll(votingWith(), {
      ana: ['bia', 'caio', 'duda'],
      bia: ['caio', 'duda', 'enzo'],
      caio: ['duda', 'bia', 'enzo'],
      duda: ['enzo', 'caio', 'bia'],
    })
    const places = Object.fromEntries(costumeRanking(contest).map((score) => [score.playerId, score.place]))
    expect(places).toEqual({ caio: 1, bia: 2, duda: 2, enzo: 3 })
  })
})

describe('fantasia em dupla ou trio', () => {
  const results = () => {
    const podium = closeVoting(castBallot(votingWith(), 'bia', NOW, ['ana', 'caio', 'duda']), 'ana', NOW)
    return [3, 2, 1].reduce((contest) => nextReveal(contest, 'ana', NOW), podium)
  }
  const groups = [
    ['ana', 'bia'],
    ['caio', 'duda', 'enzo'],
  ]

  it('só o anfitrião abre a surpresa depois dos resultados', () => {
    expect(violation(() => startGroupContest(votingWith(), 'ana', NOW))).toBe('notInResults')
    expect(violation(() => startGroupContest(results(), 'bia', NOW))).toBe('notHost')
    expect(startGroupContest(results(), 'ana', NOW).stage).toBe('duoSetup')
  })

  it('aceita só duplas e trios, sem repetir pessoa e com pelo menos 2 grupos', () => {
    const setup = startGroupContest(results(), 'ana', NOW)
    expect(violation(() => setGroups(setup, 'ana', NOW, [['ana', 'bia']]))).toBe('invalidGroups')
    expect(violation(() => setGroups(setup, 'ana', NOW, [['ana'], ['bia', 'caio']]))).toBe('invalidGroups')
    expect(
      violation(() =>
        setGroups(setup, 'ana', NOW, [
          ['ana', 'bia', 'caio', 'duda'],
          ['enzo', 'ana'],
        ]),
      ),
    ).toBe('invalidGroups')
    expect(setGroups(setup, 'ana', NOW, groups).stage).toBe('duoVoting')
  })

  it('guarda os grupos sem lista dentro de lista, que o Firestore recusa', () => {
    const hasNestedArray = (value: unknown): boolean =>
      Array.isArray(value)
        ? value.some((item) => Array.isArray(item) || hasNestedArray(item))
        : typeof value === 'object' && value !== null && Object.values(value).some(hasNestedArray)
    expect(hasNestedArray(setGroups(startGroupContest(results(), 'ana', NOW), 'ana', NOW, groups))).toBe(false)
  })

  it('não deixa votar no próprio grupo e revela o campeão quando todos votam', () => {
    let contest = setGroups(startGroupContest(results(), 'ana', NOW), 'ana', NOW, groups)
    expect(violation(() => castGroupBallot(contest, 'ana', NOW, 0))).toBe('invalidBallot')
    for (const voter of ['ana', 'bia']) contest = castGroupBallot(contest, voter, NOW, 1)
    expect(missingGroupVoters(contest)).toEqual(['caio', 'duda', 'enzo'])
    for (const voter of ['caio', 'duda', 'enzo']) contest = castGroupBallot(contest, voter, NOW, 0)
    expect(contest).toMatchObject({ stage: 'duoPodium', revealPlace: 1 })
    expect(groupRanking(contest)).toEqual([
      { groupIndex: 0, votes: 3, place: 1 },
      { groupIndex: 1, votes: 2, place: 2 },
    ])
    expect(nextReveal(contest, 'ana', NOW).stage).toBe('duoResults')
  })

  it('quem não está em grupo também vota, e o anfitrião pode apurar antes', () => {
    const contest = setGroups(startGroupContest(results(), 'ana', NOW), 'ana', NOW, [
      ['ana', 'bia'],
      ['caio', 'duda'],
    ])
    expect(missingGroupVoters(contest)).toContain('enzo')
    const voted = castGroupBallot(contest, 'enzo', NOW, 0)
    expect(closeGroupVoting(voted, 'ana', NOW).stage).toBe('duoPodium')
  })
})
