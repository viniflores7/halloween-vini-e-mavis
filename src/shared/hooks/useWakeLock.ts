import { useEffect } from 'react'

// Mantém a tela acesa durante a rodada; o navegador solta a trava quando a aba sai de foco
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | undefined
    let released = false

    const request = () => {
      if (document.visibilityState !== 'visible') return
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          if (released) lock.release()
          else sentinel = lock
        })
        .catch(() => undefined)
    }

    request()
    document.addEventListener('visibilitychange', request)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', request)
      sentinel?.release().catch(() => undefined)
    }
  }, [active])
}
