import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { contestContent as copy } from '@/content/contest'
import { describeError } from '@/content/errors'
import { getContestRepository, isContestHost, MAX_PARTICIPANTS, MIN_PARTICIPANTS, type Contest } from '@/data/contests'
import type { Player } from '@/data/realtime'
import { ParticipantGrid } from '@/features/participants'
import { RoomShare } from '@/features/room-share'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { BackIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

interface ContestLobbyProps {
  contest: Contest
  players: Player[]
  myId: string
  onEditProfile: () => void
}

export function ContestLobby({ contest, players, myId, onEditProfile }: ContestLobbyProps) {
  const navigate = useNavigate()
  const host = isContestHost(contest, myId)
  const starting = useAsyncAction(describeError)
  const leaving = useAsyncAction(describeError)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const missing = Math.max(0, MIN_PARTICIPANTS - players.length)

  const start = () => starting.run(async () => (await getContestRepository()).startVoting(contest.code))

  async function leave() {
    if (await leaving.run(async () => (await getContestRepository()).leave(contest.code))) navigate('/concurso')
  }

  return (
    <div className="page contest-lobby">
      <Link to="/concurso" className="back-link">
        <BackIcon /> {copy.back}
      </Link>
      <RoomShare
        code={contest.code}
        path="concurso"
        shareTitle={copy.shareTitle}
        shareText={copy.shareText(contest.code)}
      />
      <ParticipantGrid
        title={copy.participants}
        players={players}
        max={MAX_PARTICIPANTS}
        hostId={contest.hostId}
        myId={myId}
        onKick={host ? async (player) => (await getContestRepository()).kick(contest.code, player.id) : undefined}
      />
      <p className="card muted small contest-lobby__rules">{copy.howItWorks}</p>

      <div className="link-row">
        <button type="button" className="link" onClick={onEditProfile}>
          {copy.editProfile}
        </button>
        <button type="button" className="link" onClick={() => setConfirmLeave(true)}>
          {copy.leave}
        </button>
      </div>

      <div className="dock">
        {host ? (
          <>
            {starting.error && <p className="error center">{starting.error}</p>}
            {missing > 0 && <p className="muted center small">{copy.needsParticipants(missing)}</p>}
            <button
              type="button"
              className="button button--primary button--block"
              disabled={missing > 0 || starting.pending}
              onClick={start}
            >
              {starting.pending ? copy.starting : copy.start}
            </button>
          </>
        ) : (
          <p className="waiting">{copy.waitingHost}</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title={copy.leaveTitle}
        confirmLabel={copy.leaveConfirm}
        cancelLabel={copy.cancel}
        pending={leaving.pending}
        error={leaving.error}
        onConfirm={leave}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  )
}
