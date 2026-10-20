import { useId, type ReactNode } from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel: string
  cancelLabel: string
  pending?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()

  return (
    <Modal open={open} onClose={onCancel} labelledBy={titleId}>
      <div className="stack">
        <h2 id={titleId} className="title center">
          {title}
        </h2>
        {children}
        {error && <p className="error center">{error}</p>}
        <button type="button" className="button button--primary button--block" disabled={pending} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="button button--block" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </Modal>
  )
}
