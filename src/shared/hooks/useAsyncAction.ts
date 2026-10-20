import { useCallback, useState } from 'react'

export function useAsyncAction(describeError: (error: unknown) => string) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setPending(true)
      setError(null)
      try {
        await action()
        return true
      } catch (caught) {
        setError(describeError(caught))
        return false
      } finally {
        setPending(false)
      }
    },
    [describeError],
  )

  return { run, pending, error, clearError: () => setError(null) }
}
