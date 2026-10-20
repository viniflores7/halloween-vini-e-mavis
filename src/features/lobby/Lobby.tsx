import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { describeError } from '@/content/errors'
import { lobbyContent as copy } from '@/content/lobby'
import type { Player } from '@/data/realtime'
import { getRoomRepository, isHost, MAX_PLAYERS, MIN_PLAYERS, type Room } from '@/data/rooms'
import { ParticipantGrid } from '@/features/participants'
import { RoomShare } from '@/features/room-share'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { BackIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import { LobbySettings } from './LobbySettings'
import './lobby.css'

interface LobbyProps {
  room: Room
  players: Player[]
  myId: string
  onEditProfile: () => void
}

export function Lobby({ room, players, myId, onEditProfile }: LobbyProps) {
  const navigate = useNavigate()
  const host = isHost(room, myId)
  const starting = useAsyncAction(describeError)
  const leaving = useAsyncAction(describeError)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const missingPlayers = Math.max(0, MIN_PLAYERS - players.length)

  const start = () => starting.run(async () => (await getRoomRepository()).startRound(room.code))

  async function leave() {
    const left = await leaving.run(async () => (await getRoomRepository()).leave(room.code))
    if (left) navigate('/jogatina')
  }

  return (
    <div className="page lobby">
      <Link to="/jogatina" className="back-link">
        <BackIcon /> {copy.back}
      </Link>
      <RoomShare code={room.code} path="sala" shareTitle={copy.shareTitle} shareText={copy.shareText(room.code)} />
      <ParticipantGrid
        title={copy.crew}
        players={players}
        max={MAX_PLAYERS}
        hostId={room.hostId}
        myId={myId}
        onKick={host ? async (player) => (await getRoomRepository()).kick(room.code, player.id) : undefined}
      />
      <LobbySettings room={room} editable={host} />

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
            {missingPlayers > 0 && <p className="muted center small">{copy.needsPlayers(missingPlayers)}</p>}
            <button
              type="button"
              className="button button--primary button--block"
              disabled={missingPlayers > 0 || starting.pending}
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
