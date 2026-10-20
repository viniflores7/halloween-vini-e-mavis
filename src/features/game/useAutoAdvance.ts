import { useEffect } from 'react'
import { advanceByClock, getRoomRepository, isHost, type Room } from '@/data/rooms'

const FALLBACK_DELAY_MS = 2500
const RETRY_INTERVAL_MS = 5000

// O anfitrião encerra a votação ou a rodada na hora certa; os outros celulares assumem se ele estiver offline
export function useAutoAdvance(room: Room | null, now: number, myId: string | null) {
  const dueKey =
    room && advanceByClock(room, now) ? `${room.status}-${room.roundsPlayed}-${room.meeting?.calledAt}` : null
  const host = Boolean(room && myId && isHost(room, myId))
  const code = room?.code

  useEffect(() => {
    if (!dueKey || !code) return
    const advance = () =>
      getRoomRepository()
        .then((repository) => repository.advanceByClock(code))
        .catch(() => undefined)
    let retry: number | undefined
    const first = window.setTimeout(
      () => {
        advance()
        retry = window.setInterval(advance, RETRY_INTERVAL_MS)
      },
      host ? 0 : FALLBACK_DELAY_MS + Math.random() * FALLBACK_DELAY_MS,
    )
    return () => {
      window.clearTimeout(first)
      window.clearInterval(retry)
    }
  }, [dueKey, host, code])
}
