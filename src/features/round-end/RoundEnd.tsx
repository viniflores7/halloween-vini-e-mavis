import { describeError } from '@/content/errors'
import { roundEndContent as copy } from '@/content/roundEnd'
import { getRoomRepository, impostorIds, isHost, roleOf, type Player, type Room } from '@/data/rooms'
import { Avatar } from '@/shared/components/Avatar'
import { Crewmate } from '@/shared/components/Crewmate'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import './roundEnd.css'

interface RoundEndProps {
  room: Room
  players: Player[]
  myId: string
}

export function RoundEnd({ room, players, myId }: RoundEndProps) {
  const result = room.result!
  const action = useAsyncAction(describeError)
  const impostors = players.filter((player) => impostorIds(room).includes(player.id))
  const myTeam = roleOf(room, myId) === 'impostor' ? 'impostors' : 'crewmates'
  const won = result.winner === myTeam

  const backToLobby = () => action.run(async () => (await getRoomRepository()).backToLobby(room.code))

  return (
    <div className={`page page--center round-end round-end--${result.winner}`}>
      <Crewmate color={result.winner === 'impostors' ? '#8e1b1b' : '#1d1915'} className="round-end__crewmate" />
      <h1 className="display round-end__title">
        {result.winner === 'impostors' ? copy.impostorsWin : copy.crewmatesWin}
      </h1>
      <p className="title round-end__personal">{won ? copy.youWon : copy.youLost}</p>
      <p className="muted center">{copy.reasons[result.reason]}</p>

      <section className="card round-end__impostors">
        <p className="label center">{copy.impostorsWere(impostors.length)}</p>
        <ul>
          {impostors.map((player) => (
            <li key={player.id}>
              <Avatar player={player} size="lg" />
              <span>{player.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {action.error && <p className="error center">{action.error}</p>}
      {isHost(room, myId) ? (
        <button
          type="button"
          className="button button--primary button--block"
          disabled={action.pending}
          onClick={backToLobby}
        >
          {copy.playAgain}
        </button>
      ) : (
        <p className="muted center">{copy.waitingHost}</p>
      )}
    </div>
  )
}
