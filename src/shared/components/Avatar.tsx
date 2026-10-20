import { Crewmate } from './Crewmate'
import './Avatar.css'

interface AvatarProps {
  player: { name: string; photo: string } | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  dead?: boolean
  className?: string
}

export function Avatar({ player, size = 'md', dead = false, className = '' }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size} ${dead ? 'avatar--dead' : ''} ${className}`}>
      {player?.photo ? (
        <img src={player.photo} alt={player.name} draggable={false} />
      ) : (
        <Crewmate withHat={false} className="avatar__crewmate" />
      )}
    </span>
  )
}
