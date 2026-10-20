import { contestRevealContent as revealCopy } from '@/content/contestReveal'
import { groupContestContent as copy } from '@/content/groupContest'
import {
  atPlace,
  COUNTING_MS,
  getContestRepository,
  groupRanking,
  isContestHost,
  revealTiming,
  type Contest,
} from '@/data/contests'
import type { Player } from '@/data/realtime'
import { Counting, PlaceReveal, RevealAction } from '@/features/contest-reveal'
import { contestGroups } from './groupMembers'

interface GroupPodiumProps {
  contest: Contest
  players: Player[]
  myId: string
  now: number
}

export function GroupPodium({ contest, players, myId, now }: GroupPodiumProps) {
  const { suspenseAt, revealedAt } = revealTiming(contest)
  if (now < suspenseAt) return <Counting startedAt={contest.stageAt} now={now} durationMs={COUNTING_MS} />

  const groups = contestGroups(contest, players)
  const winners = atPlace(groupRanking(contest), 1).map((score) => {
    const group = groups[score.groupIndex]
    return { id: String(group.index), name: group.name, players: group.members, detail: revealCopy.votes(score.votes) }
  })

  return (
    <PlaceReveal
      place={1}
      kicker={copy.winnerKicker}
      winners={winners}
      suspenseAt={suspenseAt}
      revealedAt={revealedAt}
      now={now}
      action={
        <RevealAction
          host={isContestHost(contest, myId)}
          label={revealCopy.showResults}
          onNext={async () => (await getContestRepository()).nextReveal(contest.code)}
        />
      }
    />
  )
}
