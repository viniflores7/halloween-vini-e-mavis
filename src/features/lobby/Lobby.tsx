import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { describeError } from '@/content/errors'
import { lobbyContent as copy } from '@/content/lobby'
import { getRoomRepository, isHost, MIN_PLAYERS, type Player, type Room } from '@/data/rooms'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { BackIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import { CrewList } from './CrewList'
import { LobbySettings } from './LobbySettings'
import { RoomShare } from './RoomShare'
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
      <RoomShare code={room.code} />
      <CrewList room={room} players={players} myId={myId} canKick={host} />
      <LobbySettings room={room} editable={host} />

      <div className="lobby__links">
        <button type="button" className="link" onClick={onEditProfile}>
          {copy.editProfile}
        </button>
        <button type="button" className="link" onClick={() => setConfirmLeave(true)}>
          {copy.leave}
        </button>
      </div>

      <div className="lobby__dock">
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
          <p className="lobby__waiting">{copy.waitingHost}</p>
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
