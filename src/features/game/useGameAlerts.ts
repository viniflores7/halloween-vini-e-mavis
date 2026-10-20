import { useEffect, useRef } from 'react'
import type { Room } from '@/data/rooms'
import { playAlarm, unlockAudio, vibrate } from '@/shared/lib/alarm'

const FRESH_EVENT_MS = 15_000

export function useGameAlerts(room: Room | null, now: number) {
  const meetingAt = room?.meeting?.calledAt ?? null
  const roundNumber = room?.status === 'playing' ? (room.round?.number ?? null) : null
  const nowRef = useRef(now)
  nowRef.current = now

  useEffect(() => {
    const unlock = () => unlockAudio()
    document.addEventListener('pointerdown', unlock, { once: true })
    return () => document.removeEventListener('pointerdown', unlock)
  }, [])

  useEffect(() => {
    if (meetingAt === null || nowRef.current - meetingAt > FRESH_EVENT_MS) return
    vibrate([300, 120, 300, 120, 300])
    playAlarm()
  }, [meetingAt])

  useEffect(() => {
    if (roundNumber !== null) vibrate([150])
  }, [roundNumber])
}
