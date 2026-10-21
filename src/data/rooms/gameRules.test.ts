import { describe, expect, it } from 'vitest'
import {
  advanceByClock,
  backToLobby,
  callMeeting,
  castVote,
  changeSettings,
  closeVoting,
  emergencyMeetingsLeft,
  joinRoom,
  MAX_PLAYERS,
  MEETING_ALERT_MS,
  newRoom,
  OUTCOME_MS,
  pickEjected,
  removeFromRoom,
  ROLE_REVEAL_MS,
  startRound,
} from './gameRules'
import { elapsedPlayMs, formatClock, MAX_ROUND_MS } from './roundTimer'
import { GameRuleError, SKIP_VOTE, type Room } from './types'

const NOW = 1_000_000
const players = ['ana', 'bia', 'caio', 'duda', 'enzo']

function lobbyWith(ids = players): Room {
  return ids.reduce((room, id) => joinRoom(room, id) ?? room, newRoom('BRUX', ids[0], NOW))
}

function playingRoom(ids = players) {
  const room = startRound(lobbyWith(ids), ids[0], NOW, () => 0)
  const impostor = ids.find((id) => room.round!.roles[id] === 'impostor')!
  const crew = ids.filter((id) => id !== impostor)
  return { room, impostor, crew, startsAt: NOW + ROLE_REVEAL_MS }
}

const violation = (run: () => unknown) => {
  try {
    run()
  } catch (error) {
    return (error as GameRuleError).violation
  }
  return null
}

describe('entrada na sala', () => {
  it('aceita no máximo 15 jogadores', () => {
    const full = lobbyWith(Array.from({ length: MAX_PLAYERS }, (_, i) => `p${i}`))
    expect(full.playerIds).toHaveLength(15)
    expect(violation(() => joinRoom(full, 'atrasado'))).toBe('roomFull')
  })

  it('não muda nada quando o jogador já está na sala', () => {
    expect(joinRoom(lobbyWith(), 'ana')).toBeNull()
  })

  it('não deixa entrar com a partida rolando', () => {
    expect(violation(() => joinRoom(playingRoom().room, 'atrasado'))).toBe('gameInProgress')
  })

  it('passa o anfitrião para o próximo quando ele sai', () => {
    const room = removeFromRoom(lobbyWith(), 'ana', 'ana')!
    expect(room.hostId).toBe('bia')
    expect(room.playerIds).not.toContain('ana')
  })

  it('só o anfitrião remove outros jogadores', () => {
    expect(violation(() => removeFromRoom(lobbyWith(), 'bia', 'caio'))).toBe('notHost')
    expect(removeFromRoom(lobbyWith(), 'ana', 'caio')!.playerIds).not.toContain('caio')
  })
})

describe('configurações', () => {
  it('só o anfitrião muda e os valores ficam dentro dos limites', () => {
    const room = lobbyWith()
    const settings = { ...room.settings, impostorCount: 0, emergencyMeetingsPerPlayer: 9, votingSeconds: 10 }
    expect(violation(() => changeSettings(room, 'bia', settings))).toBe('notHost')
    expect(changeSettings(room, 'ana', settings).settings).toMatchObject({
      impostorCount: 1,
      emergencyMeetingsPerPlayer: 5,
      votingSeconds: 30,
    })
  })
})

describe('início da rodada', () => {
  it('exige pelo menos 2 jogadores', () => {
    expect(violation(() => startRound(lobbyWith(['ana']), 'ana', NOW))).toBe('notEnoughPlayers')
  })

  it('com 2 jogadores sorteia 1 impostor e termina na primeira denúncia', () => {
    const { room, impostor, crew, startsAt } = playingRoom(['ana', 'bia'])
    expect(callMeeting(room, impostor, startsAt, 'report', crew[0]).result).toEqual({
      winner: 'impostors',
      reason: 'impostorsOutnumber',
    })
    expect(callMeeting(room, crew[0], startsAt, 'report', impostor).result).toEqual({
      winner: 'crewmates',
      reason: 'impostorsEliminated',
    })
  })

  it('sorteia a quantidade de impostores permitida para o número de jogadores', () => {
    const room = changeSettings(lobbyWith(), 'ana', { ...lobbyWith().settings, impostorCount: 3 })
    const roles = Object.values(startRound(room, 'ana', NOW).round!.roles)
    expect(roles.filter((role) => role === 'impostor')).toHaveLength(1)
    expect(roles).toHaveLength(5)
  })

  it('começa a contar do zero depois da revelação dos papéis', () => {
    const { room, startsAt } = playingRoom()
    expect(room.round!.startsAt).toBe(startsAt)
    expect(elapsedPlayMs(room.round!, NOW)).toBe(0)
    expect(elapsedPlayMs(room.round!, startsAt + 90_000)).toBe(90_000)
  })
})

describe('reuniões', () => {
  it('denunciar uma morte marca o morto e pausa o timer', () => {
    const { room, crew, startsAt } = playingRoom()
    const meeting = callMeeting(room, crew[0], startsAt + 60_000, 'report', crew[1])
    expect(meeting.status).toBe('meeting')
    expect(meeting.round!.dead).toEqual([crew[1]])
    expect(elapsedPlayMs(meeting.round!, startsAt + 600_000)).toBe(60_000)
  })

  it('não deixa denunciar a si mesmo e o morto continua morto depois da votação', () => {
    const { room, crew, startsAt } = playingRoom()
    expect(violation(() => callMeeting(room, crew[0], startsAt, 'report', crew[0]))).toBe('invalidVictim')
    const afterVote = castVote(callMeeting(room, crew[0], startsAt, 'report', crew[1]), crew[0], startsAt, SKIP_VOTE)
    expect(afterVote.round!.dead).toContain(crew[1])
  })

  it('limita as reuniões de emergência por jogador', () => {
    const { room, crew, startsAt } = playingRoom()
    const meeting = callMeeting(room, crew[0], startsAt, 'emergency')
    expect(emergencyMeetingsLeft(meeting, crew[0])).toBe(0)
    const resumed = closeVoting(meeting, 'ana', startsAt + 1000)!
    const later = startsAt + 1000 + OUTCOME_MS
    expect(violation(() => callMeeting(resumed, crew[0], later, 'emergency'))).toBe('noEmergencyLeft')
  })

  it('não aceita reunião durante a revelação dos papéis', () => {
    const { room, crew } = playingRoom()
    expect(violation(() => callMeeting(room, crew[0], NOW + 1000, 'emergency'))).toBe('notPlaying')
  })

  it('termina com vitória dos impostores quando a denúncia os deixa em maioria', () => {
    const { room, crew, impostor, startsAt } = playingRoom(['ana', 'bia', 'caio'])
    const ended = callMeeting(room, impostor, startsAt, 'report', crew[0])
    expect(ended.status).toBe('ended')
    expect(ended.result).toEqual({ winner: 'impostors', reason: 'impostorsOutnumber' })
  })
})

describe('votação', () => {
  it('ejeta o mais votado assim que todos os vivos votam e retoma o timer depois do resultado', () => {
    const { room, crew, impostor, startsAt } = playingRoom()
    const calledAt = startsAt + 60_000
    let meeting = callMeeting(room, crew[0], calledAt, 'emergency')
    for (const voter of [...crew, impostor]) {
      meeting = castVote(meeting, voter, calledAt + 1000, voter === impostor ? crew[0] : impostor)
    }
    expect(meeting.status).toBe('ended')
    expect(meeting.result).toEqual({ winner: 'crewmates', reason: 'impostorsEliminated' })
    expect(meeting.lastOutcome).toMatchObject({ ejectedId: impostor, ejectedWasImpostor: true })
  })

  it('volta a jogar quando ejeta um tripulante e congela o timer enquanto mostra o resultado', () => {
    const { room, crew, impostor, startsAt } = playingRoom()
    const calledAt = startsAt + 60_000
    let meeting = callMeeting(room, crew[0], calledAt, 'emergency')
    for (const voter of [...crew, impostor]) meeting = castVote(meeting, voter, calledAt + 1000, crew[3])
    expect(meeting.status).toBe('playing')
    expect(meeting.lastOutcome).toMatchObject({ ejectedId: crew[3], ejectedWasImpostor: false })
    expect(elapsedPlayMs(meeting.round!, calledAt + 1000 + OUTCOME_MS - 1)).toBe(60_000)
    expect(elapsedPlayMs(meeting.round!, calledAt + 1000 + OUTCOME_MS + 30_000)).toBe(90_000)
  })

  it('não aceita voto duplicado, de morto ou em morto', () => {
    const { room, crew, startsAt } = playingRoom()
    const meeting = callMeeting(room, crew[0], startsAt, 'report', crew[1])
    expect(violation(() => castVote(meeting, crew[1], startsAt, SKIP_VOTE))).toBe('notAlive')
    expect(violation(() => castVote(meeting, crew[0], startsAt, crew[1]))).toBe('invalidVote')
    const voted = castVote(meeting, crew[0], startsAt, SKIP_VOTE)
    expect(violation(() => castVote(voted, crew[0], startsAt, SKIP_VOTE))).toBe('alreadyVoted')
  })

  it('só o anfitrião encerra a votação antes do prazo', () => {
    const { room, crew, startsAt } = playingRoom()
    const meeting = callMeeting(room, crew[0], startsAt, 'emergency')
    expect(violation(() => closeVoting(meeting, crew[1], startsAt + 1000))).toBe('votingOpen')
    expect(closeVoting(meeting, 'ana', startsAt + 1000)!.status).toBe('playing')
  })

  it('encerra a votação sozinha quando o prazo acaba', () => {
    const { room, crew, startsAt } = playingRoom()
    const meeting = callMeeting(room, crew[0], startsAt, 'emergency')
    const deadline = startsAt + MEETING_ALERT_MS + room.settings.votingSeconds * 1000
    expect(advanceByClock(meeting, deadline - 1)).toBeNull()
    expect(advanceByClock(meeting, deadline)!.lastOutcome).toMatchObject({ ejectedId: null })
  })
})

describe('pickEjected', () => {
  it.each([
    [{ ana: 3, bia: 1 }, 'ana'],
    [{ ana: 2, bia: 2 }, null],
    [{ ana: 2, [SKIP_VOTE]: 2 }, null],
    [{ ana: 2, [SKIP_VOTE]: 1 }, 'ana'],
    [{}, null],
  ])('com %o ejeta %s', (tally, expected) => {
    expect(pickEjected(tally)).toBe(expected)
  })
})

describe('limite de 3 horas', () => {
  it('encerra a rodada sem vencedor e para o relógio em 3h', () => {
    const { room, crew, startsAt } = playingRoom()
    const limit = startsAt + MAX_ROUND_MS
    expect(advanceByClock(room, limit - 1)).toBeNull()
    expect(advanceByClock(room, limit)!.result).toEqual({ winner: null, reason: 'timeLimit' })
    expect(elapsedPlayMs(room.round!, limit + 60_000)).toBe(MAX_ROUND_MS)
    expect(violation(() => callMeeting(room, crew[0], limit, 'emergency'))).toBe('timeLimitReached')
  })

  it('o anfitrião volta todos para o lobby mantendo os jogadores', () => {
    const { room, startsAt } = playingRoom()
    const ended = advanceByClock(room, startsAt + MAX_ROUND_MS)!
    const lobby = backToLobby(ended, 'ana')
    expect(lobby).toMatchObject({ status: 'lobby', round: null, roundsPlayed: 1, playerIds: players })
  })
})

describe('formatClock', () => {
  it.each([
    [0, '00:00'],
    [59_999, '00:59'],
    [65_000, '01:05'],
    [3_600_000, '1:00:00'],
    [MAX_ROUND_MS, '3:00:00'],
  ])('mostra %i ms como %s', (ms, expected) => {
    expect(formatClock(ms)).toBe(expected)
  })
})
