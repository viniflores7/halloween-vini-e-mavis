import { useState } from 'react'
import { describeError } from '@/content/errors'
import { participantsContent as copy } from '@/content/participants'
import type { Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { CloseIcon, CrownIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import './participants.css'

interface ParticipantGridProps {
  title: string
  players: Player[]
  max: number
  hostId: string
  myId: string
  onKick?: (player: Player) => Promise<unknown>
}

export function ParticipantGrid({ title, players, max, hostId, myId, onKick }: ParticipantGridProps) {
  const [kicking, setKicking] = useState<Player | null>(null)
  const kick = useAsyncAction(describeError)

  async function confirmKick() {
    if (!kicking || !onKick) return
    const removed = await kick.run(() => onKick(kicking))
    if (removed) setKicking(null)
  }

  return (
    <section className="crew">
      <h2 className="label crew__title">
        {title}{' '}
        <span className="crew__count">
          {players.length}/{max}
        </span>
      </h2>
      <ul className="crew__grid">
        {players.map((player) => (
          <li key={player.id} className="crew__member">
            <span className="crew__avatar">
              <Avatar player={player} size="lg" />
              {player.id === hostId && <CrownIcon className="crew__crown" aria-label={copy.host} />}
              {onKick && player.id !== myId && (
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
