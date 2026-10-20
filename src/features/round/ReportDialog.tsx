import { useId, useState } from 'react'
import { roundContent as copy } from '@/content/round'
import type { Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import { Modal } from '@/shared/components/Modal'

interface ReportDialogProps {
  open: boolean
  candidates: Player[]
  pending: boolean
  error: string | null
  onReport: (victimId: string) => void
  onCancel: () => void
}

export function ReportDialog({ open, candidates, pending, error, onReport, onCancel }: ReportDialogProps) {
  const titleId = useId()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = candidates.find((player) => player.id === selectedId)

  function close() {
    setSelectedId(null)
    onCancel()
  }

  return (
    <Modal open={open} onClose={close} labelledBy={titleId}>
      <div className="stack">
        <h2 id={titleId} className="title center">
          {copy.reportTitle}
        </h2>
        <ul className="pick-list" role="radiogroup" aria-labelledby={titleId}>
          {candidates.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                role="radio"
                aria-checked={player.id === selectedId}
                className={`pick-list__option ${player.id === selectedId ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(player.id)}
              >
                <Avatar player={player} size="sm" dead={player.id === selectedId} />
                <span>{player.name}</span>
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="error center">{error}</p>}
        <button
          type="button"
          className="button button--primary button--block"
          disabled={!selected || pending}
          onClick={() => selected && onReport(selected.id)}
        >
          {selected ? copy.reportConfirm(selected.name) : copy.reportPick}
        </button>
        <button type="button" className="button button--block" onClick={close}>
          {copy.cancel}
        </button>
      </div>
    </Modal>
  )
}
