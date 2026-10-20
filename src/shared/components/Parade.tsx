import { useState, type ReactNode } from 'react'
import { Overlay } from './Overlay'
import './Parade.css'

interface ParadeProps {
  kicker: string
  title: string
  outro: string
  startedAt: number
  now: number
  introMs: number
  stepMs: number
  items: { key: string; node: ReactNode }[]
  className?: string
}

// Os atrasos usam o tempo já passado ao abrir a tela, para quem entra no meio ver o desfile no mesmo ponto
export function Parade({ kicker, title, outro, startedAt, now, introMs, stepMs, items, className = '' }: ParadeProps) {
  const [elapsedAtMount] = useState(() => now - startedAt)
  const delay = (ms: number) => ({ animationDelay: `${ms - elapsedAtMount}ms` })

  return (
    <Overlay>
      <div className={`spotlight parade ${items.length > 16 ? 'parade--crowded' : ''} ${className}`}>
        <p className="label parade__kicker">{kicker}</p>
        <h1 className="display parade__title">{title}</h1>
        <ul className="parade__items">
          {items.map((item, index) => (
            <li key={item.key} className="parade__item" style={delay(introMs + index * stepMs)}>
              {item.node}
            </li>
          ))}
        </ul>
        <p className="title parade__outro" style={delay(introMs + items.length * stepMs)}>
          {outro}
        </p>
      </div>
    </Overlay>
  )
}
