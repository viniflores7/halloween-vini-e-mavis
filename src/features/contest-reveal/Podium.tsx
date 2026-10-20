import { atPlace, type CostumeScore } from '@/data/contests'
import { findPlayer, type Player } from '@/data/realtime'
import { AvatarStack } from '@/shared/components/AvatarStack'
import './contestReveal.css'

const PODIUM_ORDER = [2, 1, 3]

interface PodiumProps {
  scores: CostumeScore[]
  players: Player[]
}

export function Podium({ scores, players }: PodiumProps) {
  return (
    <div className="podium">
      {PODIUM_ORDER.map((place) => {
        const winners = atPlace(scores, place).flatMap((score) => findPlayer(players, score.playerId) ?? [])
        if (winners.length === 0) return null
        return (
          <div key={place} className={`podium__column podium__column--${place}`}>
            <AvatarStack players={winners} size={place === 1 ? 'lg' : 'md'} />
            <p className="podium__names">{winners.map((player) => player.name).join(' · ')}</p>
            <div className="podium__block">
              <span className={`medal medal--${place}`}>{place}º</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
