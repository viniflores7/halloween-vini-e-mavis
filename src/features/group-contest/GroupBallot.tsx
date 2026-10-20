import { useState } from 'react'
import { describeError } from '@/content/errors'
import { groupContestContent as copy } from '@/content/groupContest'
import { getContestRepository, type Contest } from '@/data/contests'
import { AvatarStack } from '@/shared/components/AvatarStack'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import type { ContestGroup } from './groupMembers'

interface GroupBallotProps {
  contest: Contest
  groups: ContestGroup[]
}

export function GroupBallot({ contest, groups }: GroupBallotProps) {
  const [selected, setSelected] = useState<ContestGroup | null>(null)
  const sending = useAsyncAction(describeError)

  const submit = () =>
    selected && sending.run(async () => (await getContestRepository()).voteGroup(contest.code, selected.index))

  return (
    <div className="page group-ballot">
      <header className="page-header">
        <h1 className="title">{copy.ballotTitle}</h1>
        <p className="muted small">{copy.ballotText}</p>
      </header>
      <ul className="group-ballot__options">
        {groups.map((group) => (
          <li key={group.index}>
            <button
              type="button"
              className={`group-card ${selected?.index === group.index ? 'is-selected' : ''}`}
              aria-pressed={selected?.index === group.index}
              onClick={() => setSelected(group)}
            >
              <AvatarStack players={group.members} size="lg" />
              <span className="group-card__name">{group.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="dock">
        {sending.error && <p className="error center">{sending.error}</p>}
        <button
          type="button"
          className="button button--primary button--block"
          disabled={!selected || sending.pending}
          onClick={submit}
        >
          {sending.pending ? copy.sending : selected ? copy.vote(selected.name) : copy.pick}
        </button>
      </div>
    </div>
  )
}
