import { roundContent as copy } from '@/content/round'
import { formatClock, MAX_ROUND_MS } from '@/data/rooms'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const ENDING_WARNING_MS = 10 * MINUTE_MS

export function RoundTimer({ elapsedMs }: { elapsedMs: number }) {
  const minuteFraction = (elapsedMs % MINUTE_MS) / MINUTE_MS
  const leftMs = MAX_ROUND_MS - elapsedMs
  const ending = leftMs <= ENDING_WARNING_MS

  return (
    <div className={`timer ${ending ? 'timer--ending' : ''}`} role="timer">
      <svg className="timer__ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle className="timer__outer" cx="60" cy="60" r="58" />
        <circle className="timer__track" cx="60" cy="60" r={RADIUS} />
        <circle
          className="timer__progress"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - minuteFraction)}
          transform="rotate(-90 60 60)"
        />
        <circle className="timer__inner" cx="60" cy="60" r="45" />
      </svg>
      <div className="timer__text">
        <span className={`timer__clock ${elapsedMs >= HOUR_MS ? 'timer__clock--hours' : ''}`}>
          {formatClock(elapsedMs)}
        </span>
        <span className="label timer__caption">
          {ending ? copy.endsIn(Math.ceil(leftMs / MINUTE_MS)) : copy.elapsed}
        </span>
      </div>
    </div>
  )
}
