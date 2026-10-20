import { useState } from 'react'
import { describeError } from '@/content/errors'
import { votingProgressContent as copy } from '@/content/costumeVoting'
import type { Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { CheckIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

interface VotingProgressProps {
  missing: Player[]
  host: boolean
  onClose: () => Promise<unknown>
}

export function VotingProgress({ missing, host, onClose }: VotingProgressProps) {
  const [confirming, setConfirming] = useState(false)
  const closing = useAsyncAction(describeError)

  async function close() {
    if (await closing.run(onClose)) setConfirming(false)
  }

  return (
    <div className="page page--center voting-progress">
      <span className="voting-progress__check">
        <CheckIcon width={40} />
      </span>
      <h1 className="title">{copy.voted}</h1>
      {missing.length === 0 ? (
        <p className="muted">{copy.everyoneVoted}</p>
      ) : (
        <>
          <p className="label">{copy.missing(missing.length)}</p>
          <ul className="voting-progress__missing">
            {missing.map((player) => (
              <li key={player.id}>
                <Avatar player={player} size="md" />
                <span>{player.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {host && missing.length > 0 && (
        <button type="button" className="link" onClick={() => setConfirming(true)}>
          {copy.closeNow}
        </button>
      )}
      <ConfirmDialog
        open={confirming}
        title={copy.closeTitle}
        confirmLabel={copy.closeConfirm}
        cancelLabel={copy.cancel}
        pending={closing.pending}
        error={closing.error}
        onConfirm={close}
        onCancel={() => setConfirming(false)}
      >
        <p className="center muted">{copy.closeText}</p>
      </ConfirmDialog>
    </div>
  )
}
