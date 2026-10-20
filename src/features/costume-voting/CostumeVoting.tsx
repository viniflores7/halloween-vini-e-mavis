import { costumeVotingContent as copy } from '@/content/costumeVoting'
import {
  getContestRepository,
  isContestHost,
  missingVoters,
  PARADE_INTRO_DELAY_MS,
  paradeDurationMs,
  paradeStepMs,
  type Contest,
} from '@/data/contests'
import type { Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import { Parade } from '@/shared/components/Parade'
import { CostumeBallot } from './CostumeBallot'
import { VotingProgress } from './VotingProgress'
import './costumeVoting.css'

interface CostumeVotingProps {
  contest: Contest
  players: Player[]
  myId: string
  now: number
}

export function CostumeVoting({ contest, players, myId, now }: CostumeVotingProps) {
  const participants = players.filter((player) => contest.participants.includes(player.id))

  if (now < contest.stageAt + paradeDurationMs(participants.length)) {
    return (
      <Parade
        kicker={copy.paradeKicker}
        title={copy.paradeTitle}
        outro={copy.paradeOutro}
        startedAt={contest.stageAt}
        now={now}
        introMs={PARADE_INTRO_DELAY_MS}
        stepMs={paradeStepMs(participants.length)}
        items={participants.map((player) => ({
          key: player.id,
          node: (
            <>
              <Avatar player={player} />
              <span>{player.name}</span>
            </>
          ),
        }))}
      />
    )
  }

  if (contest.participants.includes(myId) && !(myId in contest.ballots)) {
    return <CostumeBallot contest={contest} candidates={participants.filter((player) => player.id !== myId)} />
  }

  const missing = missingVoters(contest)
  return (
    <VotingProgress
      missing={participants.filter((player) => missing.includes(player.id))}
      host={isContestHost(contest, myId)}
      onClose={async () => (await getContestRepository()).closeVoting(contest.code)}
    />
  )
}
