import { useEffect, useState } from 'react'

export function useNow(clock: () => number = Date.now, intervalMs = 1000) {
  const [now, setNow] = useState(clock)

  useEffect(() => {
    const id = window.setInterval(() => setNow(clock()), intervalMs)
    return () => window.clearInterval(id)
  }, [clock, intervalMs])

  return now
}
