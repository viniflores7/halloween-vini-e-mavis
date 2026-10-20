import { useState } from 'react'

export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false)

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), resetAfterMs)
  }

  return { copied, copy }
}
