import { Link } from 'react-router'
import { contestRevealContent as revealCopy } from '@/content/contestReveal'
import { groupContestContent as copy } from '@/content/groupContest'
import { atPlace, groupRanking, type Contest } from '@/data/contests'
import type { Player } from '@/data/realtime'
import { VoteBreakdown } from '@/features/contest-reveal'
import { AvatarStack } from '@/shared/components/AvatarStack'
import { contestGroups } from './groupMembers'
import './groupContest.css'

interface GroupResultsProps {
  contest: Contest
  players: Player[]
}

export function GroupResults({ contest, players }: GroupResultsProps) {
  const groups = contestGroups(contest, players)
  const winners = atPlace(groupRanking(contest), 1)
  const rows = players
    .filter((player) => contest.participants.includes(player.id))
    .map((voter) => {
      const choice = contest.groupBallots[voter.id]
      return {
        voter,
        choices:
          choice === undefined
            ? null
            : [{ badge: <span className="medal medal--1 medal--small">1º</span>, name: groups[choice]?.name ?? '?' }],
      }
    })

  return (
    <div className="page group-results">
      <header className="page-header group-results__header">
        <p className="label">{copy.winnerKicker}</p>
        {winners.map((score) => (
          <div key={score.groupIndex} className="group-results__winner">
            <AvatarStack players={groups[score.groupIndex].members} size="lg" />
            <p className="title">{groups[score.groupIndex].name}</p>
            <p className="muted">{revealCopy.votes(score.votes)}</p>
          </div>
        ))}
      </header>
      <VoteBreakdown title={copy.whoVotedWhom} rows={rows} emptyLabel={copy.didNotVote} />
      <p className="title center group-results__end">{copy.theEnd}</p>
      <Link to="/" className="button button--block">
        {copy.home}
      </Link>
    </div>
  )
}
