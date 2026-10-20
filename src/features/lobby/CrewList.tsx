import { useState } from 'react'
import { describeError } from '@/content/errors'
import { lobbyContent as copy } from '@/content/lobby'
import { getRoomRepository, MAX_PLAYERS, type Player, type Room } from '@/data/rooms'
import { Avatar } from '@/shared/components/Avatar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { CloseIcon, CrownIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

interface CrewListProps {
  room: Room
  players: Player[]
  myId: string
  canKick: boolean
}

export function CrewList({ room, players, myId, canKick }: CrewListProps) {
  const [kicking, setKicking] = useState<Player | null>(null)
  const kick = useAsyncAction(describeError)

  async function confirmKick() {
    if (!kicking) return
    const removed = await kick.run(async () => (await getRoomRepository()).kick(room.code, kicking.id))
    if (removed) setKicking(null)
  }

  return (
    <section className="crew">
      <h2 className="label crew__title">
        {copy.crew}{' '}
        <span className="crew__count">
          {players.length}/{MAX_PLAYERS}
        </span>
      </h2>
      <ul className="crew__grid">
        {players.map((player) => (
          <li key={player.id} className="crew__member">
            <span className="crew__avatar">
              <Avatar player={player} size="lg" />
              {player.id === room.hostId && <CrownIcon className="crew__crown" aria-label={copy.host} />}
              {canKick && player.id !== myId && (
                <button
                  type="button"
                  className="crew__kick"
                  aria-label={copy.kick(player.name)}
                  onClick={() => setKicking(player)}
                >
                  <CloseIcon width={14} />
                </button>
              )}
            </span>
            <span className="crew__name">{player.name}</span>
            {player.id === myId && <span className="badge">{copy.you}</span>}
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={Boolean(kicking)}
        title={kicking ? copy.kickTitle(kicking.name) : ''}
        confirmLabel={copy.kickConfirm}
        cancelLabel={copy.cancel}
        pending={kick.pending}
        error={kick.error}
        onConfirm={confirmKick}
        onCancel={() => {
          setKicking(null)
          kick.clearError()
        }}
      />
    </section>
  )
}
