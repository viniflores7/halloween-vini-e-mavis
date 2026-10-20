import { Avatar } from './Avatar'

interface AvatarStackProps {
  players: { name: string; photo: string }[]
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AvatarStack({ players, size = 'lg', className = '' }: AvatarStackProps) {
  return (
    <span className={`avatar-stack ${className}`}>
      {players.map((player, index) => (
        <Avatar key={index} player={player} size={size} />
      ))}
    </span>
  )
}
