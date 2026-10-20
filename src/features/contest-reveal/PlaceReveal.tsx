import { useEffect, type ReactNode } from 'react'
import { contestRevealContent as copy } from '@/content/contestReveal'
import { AvatarStack } from '@/shared/components/AvatarStack'
import { Confetti } from '@/shared/components/Confetti'
import { Overlay } from '@/shared/components/Overlay'
import { vibrate } from '@/shared/lib/alarm'
import './contestReveal.css'

export interface RevealWinner {
  id: string
  name: string
  players: { name: string; photo: string }[]
  detail: string
}

interface PlaceRevealProps {
  place: number
  winners: RevealWinner[]
  suspenseAt: number
  revealedAt: number
  now: number
  kicker?: string
  action: ReactNode
}

const DRUMS = 3

export function PlaceReveal({ place, winners, suspenseAt, revealedAt, now, kicker, action }: PlaceRevealProps) {
  const revealed = now >= revealedAt
  const placeLabel = copy.places[place]
  const drumsOn = Math.floor(((now - suspenseAt) / (revealedAt - suspenseAt)) * (DRUMS + 1))

  useEffect(() => {
    if (revealed) vibrate([90, 50, 240])
  }, [revealed])

  return (
    <Overlay>
      <div className={`spotlight place-reveal place-reveal--${place} ${revealed ? 'is-revealed' : ''}`}>
        {kicker && <p className="label place-reveal__kicker">{kicker}</p>}
        {!revealed ? (
          <>
            <span className={`medal medal--${place} place-reveal__medal place-reveal__medal--drum`}>{place}º</span>
            <p className="title place-reveal__suspense">{copy.suspense(placeLabel)}</p>
            <span className="place-reveal__drums" aria-hidden="true">
              {Array.from({ length: DRUMS }, (_, index) => (
                <span key={index} className={index < drumsOn ? 'is-on' : ''} />
              ))}
            </span>
          </>
        ) : (
          <>
            <span className="place-reveal__rays" aria-hidden="true" />
            <span className={`medal medal--${place} place-reveal__medal`}>{placeLabel}</span>
            {winners.length > 1 && <p className="label place-reveal__tie">{copy.tie}</p>}
            <ul className={`place-reveal__winners ${winners.length > 1 ? 'is-tie' : ''}`}>
              {winners.map((winner) => (
                <li key={winner.id} className={winner.players.length > 1 ? 'is-group' : ''}>
                  <AvatarStack players={winner.players} size={winners.length > 1 ? 'lg' : 'xl'} />
                  <p className="display place-reveal__name">{winner.name}</p>
                  <p className="place-reveal__detail">{winner.detail}</p>
                </li>
              ))}
            </ul>
            <div className="place-reveal__action">{action}</div>
            {place === 1 && <Confetti />}
          </>
        )}
      </div>
    </Overlay>
  )
}
