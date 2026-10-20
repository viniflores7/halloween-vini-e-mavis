import { contestRevealContent as copy } from '@/content/contestReveal'
import { Overlay } from '@/shared/components/Overlay'
import './contestReveal.css'

interface CountingProps {
  startedAt: number
  now: number
  durationMs: number
}

export function Counting({ startedAt, now, durationMs }: CountingProps) {
  const progress = Math.min(1, Math.max(0, (now - startedAt) / durationMs))

  return (
    <Overlay>
      <div className="spotlight counting" role="status">
        <div className="counting__urn" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <span key={index} className="counting__slip" style={{ animationDelay: `${index * 0.35}s` }} />
          ))}
          <svg viewBox="0 0 120 100">
            <path d="M14 30h92l-8 64H22z" fill="#5a3b22" stroke="#f2ead8" strokeWidth="3" strokeLinejoin="round" />
            <rect x="8" y="22" width="104" height="12" rx="3" fill="#7a5130" stroke="#f2ead8" strokeWidth="3" />
            <rect x="40" y="25" width="40" height="5" rx="2" fill="#120d09" />
            <path d="M44 60h32" stroke="#e3c16f" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <p className="display counting__title">{copy.counting}</p>
        <div className="counting__bar">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </Overlay>
  )
}
