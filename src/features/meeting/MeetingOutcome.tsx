import { meetingContent as copy } from '@/content/meeting'
import {
  alivePlayerIds,
  findPlayer,
  impostorIds,
  SKIP_VOTE,
  type MeetingOutcome as Outcome,
  type Player,
  type Room,
} from '@/data/rooms'
import { Avatar } from '@/shared/components/Avatar'
import { Crewmate } from '@/shared/components/Crewmate'
import { Overlay } from '@/shared/components/Overlay'
import './meeting.css'

interface MeetingOutcomeProps {
  room: Room
  players: Player[]
  outcome: Outcome
}

export function MeetingOutcome({ room, players, outcome }: MeetingOutcomeProps) {
  const ejected = findPlayer(players, outcome.ejectedId)
  const skipVotes = outcome.tally[SKIP_VOTE] ?? 0
  const topPlayerVotes = Math.max(0, ...Object.entries(outcome.tally).flatMap(([id, n]) => (id === SKIP_VOTE ? [] : n)))
  const impostorsLeft = impostorIds(room).filter((id) => alivePlayerIds(room).includes(id)).length
  const voted = players.filter((player) => outcome.tally[player.id])

  return (
    <Overlay>
      <div className="outcome" role="alert">
        <div className="outcome__space" aria-hidden="true">
          {ejected ? (
            <Avatar player={ejected} size="xl" className="outcome__ejected" />
          ) : (
            <Crewmate className="outcome__nobody" />
          )}
        </div>

        <p className="title outcome__line">
          {ejected
            ? copy.ejected(ejected.name)
            : skipVotes >= topPlayerVotes
              ? copy.noEjectionSkip
              : copy.noEjectionTie}
        </p>
        {ejected && (
          <p className={`outcome__reveal ${outcome.ejectedWasImpostor ? 'is-impostor' : ''}`}>
            {outcome.ejectedWasImpostor ? copy.wasImpostor(ejected.name) : copy.wasNotImpostor(ejected.name)}
          </p>
        )}
        {room.status !== 'ended' && <p className="outcome__left">{copy.impostorsLeft(impostorsLeft)}</p>}

        <ul className="outcome__tally">
          {voted.map((player) => (
            <li key={player.id}>
              <Avatar player={player} size="sm" />
              <span>{player.name}</span>
              <strong>{copy.votes(outcome.tally[player.id])}</strong>
            </li>
          ))}
          {skipVotes > 0 && (
            <li>
              <span className="outcome__skip" aria-hidden="true">
                ↷
              </span>
              <span>{copy.skipVotes}</span>
              <strong>{copy.votes(skipVotes)}</strong>
            </li>
          )}
        </ul>
      </div>
    </Overlay>
  )
}
