import { groupContestContent as copy } from '@/content/groupContest'
import { isContestHost, SURPRISE_MS, type Contest } from '@/data/contests'
import type { Player } from '@/data/realtime'
import { Notice } from '@/shared/components/Notice'
import { GroupBuilder } from './GroupBuilder'
import { GroupSurprise } from './GroupSurprise'
import './groupContest.css'

interface GroupSetupProps {
  contest: Contest
  players: Player[]
  myId: string
  now: number
}

export function GroupSetup({ contest, players, myId, now }: GroupSetupProps) {
  if (now < contest.stageAt + SURPRISE_MS) return <GroupSurprise />
  if (!isContestHost(contest, myId)) return <Notice title={copy.waitingBuilder} loading />
  return (
    <GroupBuilder
      contest={contest}
      participants={players.filter((player) => contest.participants.includes(player.id))}
    />
  )
}
