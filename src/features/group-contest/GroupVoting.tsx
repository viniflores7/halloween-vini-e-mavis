import { groupContestContent as copy } from '@/content/groupContest'
import {
  getContestRepository,
  isContestHost,
  missingGroupVoters,
  PARADE_INTRO_DELAY_MS,
  paradeDurationMs,
  paradeStepMs,
  votableGroups,
  type Contest,
} from '@/data/contests'
import type { Player } from '@/data/realtime'
import { VotingProgress } from '@/features/costume-voting'
import { AvatarStack } from '@/shared/components/AvatarStack'
import { Parade } from '@/shared/components/Parade'
import { GroupBallot } from './GroupBallot'
import { contestGroups } from './groupMembers'
import './groupContest.css'

interface GroupVotingProps {
  contest: Contest
  players: Player[]
  myId: string
  now: number
}

export function GroupVoting({ contest, players, myId, now }: GroupVotingProps) {
  const groups = contestGroups(contest, players)

  if (now < contest.stageAt + paradeDurationMs(groups.length)) {
    return (
      <Parade
        className="parade--groups"
        kicker={copy.paradeKicker}
        title={copy.paradeTitle}
        outro={copy.paradeOutro}
        startedAt={contest.stageAt}
        now={now}
        introMs={PARADE_INTRO_DELAY_MS}
        stepMs={paradeStepMs(groups.length)}
        items={groups.map((group) => ({
          key: String(group.index),
          node: (
            <>
              <AvatarStack players={group.members} size="md" />
              <span>{group.name}</span>
            </>
          ),
        }))}
      />
    )
  }

  const options = votableGroups(contest, myId)
  if (contest.participants.includes(myId) && options.length > 0 && !(myId in contest.groupBallots)) {
    return <GroupBallot contest={contest} groups={groups.filter((group) => options.includes(group.index))} />
  }

  const missing = missingGroupVoters(contest)
  return (
    <VotingProgress
      missing={players.filter((player) => missing.includes(player.id))}
      host={isContestHost(contest, myId)}
      onClose={async () => (await getContestRepository()).closeGroupVoting(contest.code)}
    />
  )
}
