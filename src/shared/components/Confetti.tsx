import { useState } from 'react'
import { Overlay } from './Overlay'
import './Confetti.css'

const COLORS = ['#d7b46a', '#b3261e', '#f2ead8', '#e07b39', '#8a5fbf', '#c0c4c8']

function randomPieces(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.6,
    duration: 2.6 + Math.random() * 2,
    size: 7 + Math.random() * 7,
    drift: (Math.random() - 0.5) * 120,
    color: COLORS[index % COLORS.length],
  }))
}

export function Confetti({ count = 70 }: { count?: number }) {
  const [pieces] = useState(() => randomPieces(count))

  return (
    <Overlay>
      <div className="confetti" aria-hidden="true">
        {pieces.map((piece, index) => (
          <span
            key={index}
            style={{
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size * 0.45,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              ['--drift' as string]: `${piece.drift}px`,
            }}
          />
        ))}
      </div>
    </Overlay>
  )
}
