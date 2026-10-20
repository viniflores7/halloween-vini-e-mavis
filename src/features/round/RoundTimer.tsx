import { roundContent as copy } from '@/content/round'
import { formatClock } from '@/data/rooms'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const URGENT_MS = 60_000

interface RoundTimerProps {
  remainingMs: number
  totalMs: number
}

export function RoundTimer({ remainingMs, totalMs }: RoundTimerProps) {
  const fraction = totalMs > 0 ? remainingMs / totalMs : 0
  const urgent = remainingMs <= URGENT_MS

  return (
    <div className={`timer ${urgent ? 'timer--urgent' : ''}`} role="timer">
      <svg className="timer__ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle className="timer__outer" cx="60" cy="60" r="58" />
        <circle className="timer__track" cx="60" cy="60" r={RADIUS} />
        <circle
          className="timer__progress"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          transform="rotate(-90 60 60)"
        />
        <circle className="timer__inner" cx="60" cy="60" r="45" />
      </svg>
      <div className="timer__text">
        <span className="timer__clock">{formatClock(remainingMs)}</span>
        <span className="label timer__caption">{copy.timeLeft}</span>
      </div>
    </div>
  )
}
