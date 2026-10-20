import type { Round } from './types'

export const MAX_ROUND_MS = 3 * 60 * 60_000

// Durante a reunião e enquanto todos veem o resultado (até `resumedAt`) o relógio fica parado
export function elapsedPlayMs(round: Round, now: number) {
  const clock = round.pausedAt ?? Math.max(now, round.resumedAt ?? now)
  return Math.min(MAX_ROUND_MS, Math.max(0, clock - round.startsAt - round.pausedMs))
}

export const reachedTimeLimit = (round: Round, now: number) => elapsedPlayMs(round, now) >= MAX_ROUND_MS

export function formatClock(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`
}
