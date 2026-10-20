import { useEffect, useRef, type ReactNode } from 'react'
import { Overlay } from './Overlay'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy: string
  className?: string
}

export function Modal({ open, onClose, children, labelledBy, className = '' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <Overlay>
      <div className="modal" onClick={onClose}>
        <div
          ref={panelRef}
          tabIndex={-1}
          className={`modal__panel ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </Overlay>
  )
}
