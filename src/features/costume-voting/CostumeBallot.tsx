import { useState } from 'react'
import { costumeVotingContent as copy } from '@/content/costumeVoting'
import { describeError } from '@/content/errors'
import { BALLOT_SIZE, getContestRepository, type Contest } from '@/data/contests'
import { findPlayer, type Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

interface CostumeBallotProps {
  contest: Contest
  candidates: Player[]
}

export function CostumeBallot({ contest, candidates }: CostumeBallotProps) {
  const [picks, setPicks] = useState<string[]>([])
  const sending = useAsyncAction(describeError)
  const missing = BALLOT_SIZE - picks.length

  const toggle = (id: string) =>
    setPicks((current) => {
      if (current.includes(id)) return current.filter((pick) => pick !== id)
      return current.length < BALLOT_SIZE ? [...current, id] : current
    })

  const submit = () => sending.run(async () => (await getContestRepository()).vote(contest.code, picks))

  return (
    <div className="page costume-ballot">
      <header className="page-header">
        <h1 className="title">{copy.title}</h1>
        <p className="muted small">{copy.instructions}</p>
      </header>

      <ol className="pick-slots">
        {copy.places.map((label, index) => {
          const player = findPlayer(candidates, picks[index])
          return (
            <li key={label} className={`pick-slot ${player ? 'is-filled' : ''}`}>
              <span className={`medal medal--${index + 1}`}>{copy.placeShort[index]}</span>
              {player ? (
                <button
                  type="button"
                  className="pick-slot__player"
                  aria-label={copy.removePick(player.name)}
                  onClick={() => toggle(player.id)}
                >
                  <Avatar player={player} size="sm" />
                  <span>{player.name}</span>
                </button>
              ) : (
                <span className="pick-slot__empty">{copy.emptySlot}</span>
              )}
            </li>
          )
        })}
      </ol>

      <ul className="costume-grid">
        {candidates.map((player) => {
          const place = picks.indexOf(player.id)
          return (
            <li key={player.id}>
              <button
                type="button"
                className={`costume-card ${place >= 0 ? `is-picked is-place-${place + 1}` : ''}`}
                aria-pressed={place >= 0}
                onClick={() => toggle(player.id)}
              >
                <span className="costume-card__photo">
                  <img src={player.photo} alt="" draggable={false} />
                  {place >= 0 && (
                    <span className={`medal medal--${place + 1} costume-card__medal`}>{copy.placeShort[place]}</span>
                  )}
                </span>
                <span className="costume-card__name">{player.name}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="dock">
        {sending.error && <p className="error center">{sending.error}</p>}
        <button
          type="button"
          className="button button--primary button--block"
          disabled={missing > 0 || sending.pending}
          onClick={submit}
        >
          {sending.pending ? copy.sending : missing > 0 ? copy.pickMore(missing) : copy.submit}
        </button>
      </div>
    </div>
  )
}
