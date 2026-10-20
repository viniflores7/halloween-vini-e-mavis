import { useEffect, useState } from 'react'

interface LiveSource<S> {
  playerId(): Promise<string>
  watch(code: string, onChange: (snapshot: S) => void, onError: (error: unknown) => void): () => void
}

type SnapshotOf<R> = R extends LiveSource<infer S> ? S : never

interface LiveConnection<R, S> {
  repository: R | null
  myId: string | null
  snapshot: S | null
  failed: boolean
}

export function useLiveSnapshot<R extends LiveSource<unknown>>(loadRepository: () => Promise<R>, code: string) {
  const [connection, setConnection] = useState<LiveConnection<R, SnapshotOf<R>>>({
    repository: null,
    myId: null,
    snapshot: null,
    failed: false,
  })

  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    const fail = () => !cancelled && setConnection((current) => ({ ...current, failed: true }))

    loadRepository()
      .then(async (repository) => {
        const myId = await repository.playerId()
        if (cancelled) return
        setConnection((current) => ({ ...current, repository, myId }))
        stop = repository.watch(
          code,
          (snapshot) =>
            setConnection((current) => ({ ...current, snapshot: snapshot as SnapshotOf<R>, failed: false })),
          fail,
        )
      })
      .catch(fail)

    return () => {
      cancelled = true
      stop?.()
    }
  }, [loadRepository, code])

  return connection
}
