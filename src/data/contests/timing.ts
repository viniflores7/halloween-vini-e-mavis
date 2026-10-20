import type { Contest } from './types'

export const COUNTING_MS = 5_000
export const SUSPENSE_MS = 4_000
export const SURPRISE_MS = 5_500
const PARADE_INTRO_MS = 1_800
const PARADE_OUTRO_MS = 2_200
const PARADE_TOTAL_STEPS_MS = 7_000
const PARADE_MAX_STEP_MS = 600

export const paradeStepMs = (count: number) => Math.min(PARADE_MAX_STEP_MS, PARADE_TOTAL_STEPS_MS / Math.max(1, count))

export const paradeDurationMs = (count: number) => PARADE_INTRO_MS + count * paradeStepMs(count) + PARADE_OUTRO_MS

export const PARADE_INTRO_DELAY_MS = PARADE_INTRO_MS

// Na primeira revelação do pódio a apuração vem antes do suspense
export function revealTiming(contest: Contest) {
  const closedAt = contest.stage === 'duoPodium' ? contest.groupsClosedAt : contest.closedAt
  const suspenseAt = contest.stageAt + (contest.stageAt === closedAt ? COUNTING_MS : 0)
  return { suspenseAt, revealedAt: suspenseAt + SUSPENSE_MS }
}
