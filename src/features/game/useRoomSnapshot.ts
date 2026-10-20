import { useEffect, useState } from 'react'
import { getRoomRepository, type RoomRepository, type RoomSnapshot } from '@/data/rooms'

interface RoomConnection {
  repository: RoomRepository | null
  myId: string | null
  snapshot: RoomSnapshot | null
  failed: boolean
}

export function useRoomSnapshot(code: string) {
  const [connection, setConnection] = useState<RoomConnection>({
    repository: null,
    myId: null,
    snapshot: null,
    failed: false,
  })

  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    const fail = () => !cancelled && setConnection((current) => ({ ...current, failed: true }))

    getRoomRepository()
      .then(async (repository) => {
        const myId = await repository.playerId()
        if (cancelled) return
        setConnection((current) => ({ ...current, repository, myId }))
        stop = repository.watch(
          code,
          (snapshot) => setConnection((current) => ({ ...current, snapshot, failed: false })),
          fail,
        )
      })
      .catch(fail)

    return () => {
      cancelled = true
      stop?.()
    }
  }, [code])

  return connection
}
