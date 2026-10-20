import { useEffect, useId, useState } from 'react'
import { lobbyContent as copy } from '@/content/lobby'
import { roomLink } from '@/data/rooms'
import { QrIcon, ShareIcon } from '@/shared/components/Icons'
import { Modal } from '@/shared/components/Modal'
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard'

export function RoomShare({ code }: { code: string }) {
  const link = roomLink(code)
  const clipboard = useCopyToClipboard()
  const [qrOpen, setQrOpen] = useState(false)

  async function share() {
    if (navigator.share) {
      try {
        return await navigator.share({ title: copy.shareTitle, text: copy.shareText(code), url: link })
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return
      }
    }
    await clipboard.copy(link).catch(() => undefined)
  }

  return (
    <section className="room-share">
      <p className="label">{copy.room}</p>
      <p className="room-share__code" aria-label={[...code].join(' ')}>
        {[...code].map((letter, index) => (
          <span key={index} aria-hidden="true">
            {letter}
          </span>
        ))}
      </p>
      <div className="room-share__actions">
        <button type="button" className="button button--small" onClick={share}>
          <ShareIcon width={18} /> {clipboard.copied ? copy.copied : copy.share}
        </button>
        <button type="button" className="button button--small" onClick={() => setQrOpen(true)}>
          <QrIcon width={18} /> {copy.showQr}
        </button>
      </div>
      <QrModal open={qrOpen} code={code} link={link} onClose={() => setQrOpen(false)} />
    </section>
  )
}

interface QrModalProps {
  open: boolean
  code: string
  link: string
  onClose: () => void
}

function QrModal({ open, code, link, onClose }: QrModalProps) {
  const titleId = useId()
  const [svg, setSvg] = useState('')

  useEffect(() => {
    if (!open || svg) return
    import('qrcode')
      .then((qrcode) =>
        qrcode.toString(link, {
          type: 'svg',
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#2e2318', light: '#f2ead8' },
        }),
      )
      .then(setSvg)
      .catch(() => undefined)
  }, [open, svg, link])

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <div className="stack qr">
        <h2 id={titleId} className="title center">
          {copy.qrTitle}
        </h2>
        <div className="qr__code" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="muted center">{copy.qrHint(code)}</p>
        <button type="button" className="button button--block" onClick={onClose}>
          {copy.close}
        </button>
      </div>
    </Modal>
  )
}
