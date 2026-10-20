import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { gameContent as copy } from '@/content/game'
import { normalizeRoomCode } from '@/data/realtime'
import { getRoomRepository, MAX_PLAYERS, type Room } from '@/data/rooms'
import { Lobby } from '@/features/lobby'
import { MeetingOutcome, MeetingScreen } from '@/features/meeting'
import { RoomGate } from '@/features/room-gate'
import { RoundEnd } from '@/features/round-end'
import { RoundScreen } from '@/features/round'
import { useLiveSnapshot } from '@/shared/hooks/useLiveSnapshot'
import { useNow } from '@/shared/hooks/useNow'
import { useWakeLock } from '@/shared/hooks/useWakeLock'
import { useAutoAdvance } from './useAutoAdvance'
import { useGameAlerts } from './useGameAlerts'

const TICK_MS = 250

export function GamePage() {
  const { code: rawCode = '' } = useParams()
  const code = normalizeRoomCode(rawCode)
  if (code !== rawCode) return <Navigate to={`/sala/${code}`} replace />
  return <Game key={code} code={code} />
}

function Game({ code }: { code: string }) {
  const connection = useLiveSnapshot(getRoomRepository, code)
  const now = useNow(connection.repository?.now ?? Date.now, TICK_MS)
  const [editingProfile, setEditingProfile] = useState(false)
  const room = connection.snapshot?.doc ?? null

  useAutoAdvance(room, now, connection.myId)
  useGameAlerts(room, now)
  useWakeLock(room?.status === 'playing' || room?.status === 'meeting')

  return (
    <RoomGate<Room>
      connection={connection}
      kind="amongUs"
      backTo="/jogatina"
      max={MAX_PLAYERS}
      isOpen={(current) => current.status === 'lobby'}
      closedText={copy.inProgressText}
      editingProfile={editingProfile}
      onProfileSaved={() => setEditingProfile(false)}
      join={async (profile) => (await getRoomRepository()).join(code, profile)}
    >
      {({ doc, players, myId }) => {
        const outcome = doc.lastOutcome && now < doc.lastOutcome.showUntil ? doc.lastOutcome : null
        if (doc.status === 'lobby') {
          return <Lobby room={doc} players={players} myId={myId} onEditProfile={() => setEditingProfile(true)} />
        }
        if (outcome) return <MeetingOutcome room={doc} players={players} outcome={outcome} />
        if (doc.status === 'meeting') return <MeetingScreen room={doc} players={players} myId={myId} now={now} />
        if (doc.status === 'ended') return <RoundEnd room={doc} players={players} myId={myId} />
        return <RoundScreen room={doc} players={players} myId={myId} now={now} />
      }}
    </RoomGate>
  )
}
