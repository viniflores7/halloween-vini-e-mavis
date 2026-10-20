import { useState } from 'react'
import { describeError } from '@/content/errors'
import { meetingContent as copy } from '@/content/meeting'
import {
  alivePlayerIds,
  findPlayer,
  formatClock,
  getRoomRepository,
  isHost,
  MEETING_ALERT_MS,
  SKIP_VOTE,
  type Player,
  type Room,
} from '@/data/rooms'
import { Avatar } from '@/shared/components/Avatar'
import { CheckIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import { MeetingAlert } from './MeetingAlert'
import './meeting.css'

interface MeetingScreenProps {
  room: Room
  players: Player[]
  myId: string
  now: number
}

export function MeetingScreen({ room, players, myId, now }: MeetingScreenProps) {
  const meeting = room.meeting!
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const action = useAsyncAction(describeError)
  const alive = alivePlayerIds(room)
  const alivePlayers = players.filter((player) => alive.includes(player.id))
  const deadPlayers = players.filter((player) => !alive.includes(player.id))
  const caller = findPlayer(players, meeting.calledBy)
  const victim = findPlayer(players, meeting.victimId)
  const myVote = meeting.votes[myId]
  const canVote = alive.includes(myId) && !myVote
  const missingVotes = alive.filter((id) => !(id in meeting.votes)).length
  const selected = findPlayer(alivePlayers, selectedId)

  const vote = (target: string) => action.run(async () => (await getRoomRepository()).vote(room.code, target))
  const closeVoting = () => action.run(async () => (await getRoomRepository()).closeVoting(room.code))

  return (
    <div className="page meeting">
      {now < meeting.calledAt + MEETING_ALERT_MS && <MeetingAlert meeting={meeting} caller={caller} victim={victim} />}

      <header className="page-header meeting__header">
        <p className="label blood">{meeting.kind === 'report' ? copy.reportAlert : copy.emergencyAlert}</p>
        <h1 className="title">{copy.title}</h1>
        <p className="muted meeting__context">
          {meeting.kind === 'report'
            ? copy.reportedBy(caller?.name ?? '?', victim?.name ?? '?')
            : copy.calledBy(caller?.name ?? '?')}
        </p>
        <p className="badge meeting__deadline">
          {copy.votingEndsIn(formatClock(Math.max(0, meeting.votingEndsAt - now)))}
        </p>
      </header>

      <ul className="ballot">
        {alivePlayers.map((player) => (
          <li key={player.id}>
            <button
              type="button"
              className={`ballot__option ${player.id === selectedId ? 'is-selected' : ''}`}
              aria-pressed={player.id === selectedId}
              disabled={!canVote}
              onClick={() => setSelectedId(player.id)}
            >
              <Avatar player={player} size="lg" />
              <span className="ballot__name">{player.name}</span>
              {player.id === myId && <span className="badge">{copy.you}</span>}
              {player.id in meeting.votes && (
                <span className="ballot__voted badge badge--solid">
                  <CheckIcon width={12} /> {copy.voted}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {deadPlayers.length > 0 && (
        <section className="meeting__dead">
          <p className="label">{copy.dead}</p>
          <ul>
            {deadPlayers.map((player) => (
              <li key={player.id}>
                <Avatar player={player} size="sm" dead />
                <span>{player.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="meeting__dock">
        {action.error && <p className="error center">{action.error}</p>}
        {canVote ? (
          <>
            <button
              type="button"
              className="button button--primary button--block"
              disabled={!selected || action.pending}
              onClick={() => selected && vote(selected.id)}
            >
              {action.pending ? copy.sending : selected ? copy.confirm(selected.name) : copy.pick}
            </button>
            <button
              type="button"
              className="button button--block"
              disabled={action.pending}
              onClick={() => vote(SKIP_VOTE)}
            >
              {copy.skip}
            </button>
          </>
        ) : (
          <p className="meeting__status">
            {!alive.includes(myId)
              ? copy.ghostText
              : `${myVote === SKIP_VOTE ? `${copy.skipped} ` : ''}${copy.votedWaiting(missingVotes)}`}
          </p>
        )}
        {isHost(room, myId) && (
          <button type="button" className="link meeting__close" disabled={action.pending} onClick={closeVoting}>
            {copy.closeVoting}
          </button>
        )}
      </div>
    </div>
  )
}
