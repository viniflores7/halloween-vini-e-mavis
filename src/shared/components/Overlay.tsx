import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Renderiza fora da área com rolagem da moldura, que corta elementos com position: fixed
export function Overlay({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}
