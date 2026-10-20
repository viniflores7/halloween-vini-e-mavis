import { contestRevealContent as copy } from '@/content/contestReveal'
import {
  atPlace,
  COUNTING_MS,
  costumeRanking,
  getContestRepository,
  isContestHost,
  revealTiming,
  type Contest,
} from '@/data/contests'
import { findPlayer, type Player } from '@/data/realtime'
import { Counting } from './Counting'
import { PlaceReveal } from './PlaceReveal'
import { RevealAction } from './RevealAction'
import './contestReveal.css'

interface CostumePodiumProps {
  contest: Contest
  players: Player[]
  myId: string
  now: number
}

export function CostumePodium({ contest, players, myId, now }: CostumePodiumProps) {
  const { suspenseAt, revealedAt } = revealTiming(contest)
  if (now < suspenseAt) return <Counting startedAt={contest.stageAt} now={now} durationMs={COUNTING_MS} />

  const winners = atPlace(costumeRanking(contest), contest.revealPlace).flatMap((score) => {
    const player = findPlayer(players, score.playerId)
    return player ? [{ id: player.id, name: player.name, players: [player], detail: copy.points(score.points) }] : []
  })

  return (
    <PlaceReveal
      place={contest.revealPlace}
      winners={winners}
      suspenseAt={suspenseAt}
      revealedAt={revealedAt}
      now={now}
      action={
        <RevealAction
          host={isContestHost(contest, myId)}
          label={contest.revealPlace > 1 ? copy.next(contest.revealPlace - 1) : copy.showResults}
          onNext={async () => (await getContestRepository()).nextReveal(contest.code)}
        />
      }
    />
  )
}
