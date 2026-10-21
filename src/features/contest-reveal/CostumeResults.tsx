import { contestRevealContent as copy } from '@/content/contestReveal'
import { describeError } from '@/content/errors'
import {
  canStartGroupContest,
  costumeRanking,
  getContestRepository,
  isContestHost,
  type Contest,
} from '@/data/contests'
import { findPlayer, type Player } from '@/data/realtime'
import { TrophyIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import { Podium } from './Podium'
import { VoteBreakdown } from './VoteBreakdown'
import './contestReveal.css'

interface CostumeResultsProps {
  contest: Contest
  players: Player[]
  myId: string
}

export function CostumeResults({ contest, players, myId }: CostumeResultsProps) {
  const action = useAsyncAction(describeError)
  const rows = players
    .filter((player) => contest.participants.includes(player.id))
    .map((voter) => ({
      voter,
      choices:
        contest.ballots[voter.id]?.map((id, index) => ({
          badge: <span className={`medal medal--${index + 1} medal--small`}>{index + 1}º</span>,
          name: findPlayer(players, id)?.name ?? '?',
        })) ?? null,
    }))

  const startGroups = () => action.run(async () => (await getContestRepository()).startGroupContest(contest.code))

  return (
    <div className="page results">
      <header className="page-header results__header">
        <TrophyIcon className="results__trophy" />
        <h1 className="display">{copy.resultsTitle}</h1>
      </header>
      <Podium scores={costumeRanking(contest)} players={players} />
      <VoteBreakdown title={copy.whoVotedWhom} rows={rows} emptyLabel={copy.didNotVote} />
      {isContestHost(contest, myId) && canStartGroupContest(contest) && (
        <div className="dock">
          {action.error && <p className="error center">{action.error}</p>}
          <button
            type="button"
            className="button button--primary button--block results__group-cta"
            disabled={action.pending}
            onClick={startGroups}
          >
            {copy.groupContest}
          </button>
        </div>
      )}
    </div>
  )
}
