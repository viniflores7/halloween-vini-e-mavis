import type { Round } from './types'

// Depois de uma reunião o relógio fica congelado até `resumedAt`, enquanto todos veem o resultado
export function elapsedPlayMs(round: Round, now: number) {
  const clock = round.pausedAt ?? Math.max(now, round.resumedAt ?? now)
  return Math.max(0, clock - round.startsAt - round.pausedMs)
}

export function remainingMs(round: Round, now: number) {
  return Math.max(0, round.durationMs - elapsedPlayMs(round, now))
}

export function formatClock(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
