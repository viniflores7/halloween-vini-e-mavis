import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { gameContent as copy } from '@/content/game'
import {
  findPlayer,
  getRoomRepository,
  MAX_PLAYERS,
  normalizeRoomCode,
  playersInRoom,
  rememberRoomCode,
  type PlayerProfile,
} from '@/data/rooms'
import { Crewmate } from '@/shared/components/Crewmate'
import { useNow } from '@/shared/hooks/useNow'
import { useWakeLock } from '@/shared/hooks/useWakeLock'
import { Lobby } from '@/features/lobby'
import { MeetingOutcome, MeetingScreen } from '@/features/meeting'
import { PlayerSetup } from '@/features/player-setup'
import { RoundEnd } from '@/features/round-end'
import { RoundScreen } from '@/features/round'
import { useAutoAdvance } from './useAutoAdvance'
import { useGameAlerts } from './useGameAlerts'
import { useRoomSnapshot } from './useRoomSnapshot'
import './game.css'

const TICK_MS = 250

export function GamePage() {
  const { code: rawCode = '' } = useParams()
  const code = normalizeRoomCode(rawCode)
  if (code !== rawCode) return <Navigate to={`/sala/${code}`} replace />
  return <Game key={code} code={code} />
}

function Game({ code }: { code: string }) {
  const { repository, myId, snapshot, failed } = useRoomSnapshot(code)
  const now = useNow(repository?.now ?? Date.now, TICK_MS)
  const [editingProfile, setEditingProfile] = useState(false)
  const room = snapshot?.room ?? null
  const players = room && snapshot ? playersInRoom(room, snapshot.players) : []
  const me = findPlayer(players, myId)

  useAutoAdvance(room, now, myId)
  useGameAlerts(room, now)
  useWakeLock(room?.status === 'playing' || room?.status === 'meeting')

  useEffect(() => {
    if (me) rememberRoomCode(code)
  }, [me, code])

  if (!snapshot || !myId) {
    return failed ? (
      <Notice title={copy.connectionError}>
        <button type="button" className="button button--block" onClick={() => window.location.reload()}>
          {copy.reload}
        </button>
      </Notice>
    ) : (
      <Notice title={copy.loading} loading />
    )
  }

  if (!room) return <Notice title={copy.notFoundTitle} text={copy.notFoundText} withBack />

  const inRoom = room.playerIds.includes(myId)
  if (!me || editingProfile) {
    if (!inRoom && room.status !== 'lobby')
      return <Notice title={copy.inProgressTitle} text={copy.inProgressText} loading />
    if (!inRoom && room.playerIds.length >= MAX_PLAYERS)
      return <Notice title={copy.fullTitle} text={copy.fullText} withBack />

    const save = async (profile: PlayerProfile) => {
      await (await getRoomRepository()).join(code, profile)
      setEditingProfile(false)
    }
    return (
      <PlayerSetup
        initial={editingProfile && me ? me : undefined}
        onSubmit={save}
        onCancel={editingProfile ? () => setEditingProfile(false) : undefined}
      />
    )
  }

  const outcome = room.lastOutcome && now < room.lastOutcome.showUntil ? room.lastOutcome : null

  return (
    <>
      {failed && <p className="game__offline">{copy.connectionError}</p>}
      {room.status === 'lobby' ? (
        <Lobby room={room} players={players} myId={myId} onEditProfile={() => setEditingProfile(true)} />
      ) : outcome ? (
        <MeetingOutcome room={room} players={players} outcome={outcome} />
      ) : room.status === 'meeting' ? (
        <MeetingScreen room={room} players={players} myId={myId} now={now} />
      ) : room.status === 'ended' ? (
        <RoundEnd room={room} players={players} myId={myId} />
      ) : (
        <RoundScreen room={room} players={players} myId={myId} now={now} />
      )}
    </>
  )
}

interface NoticeProps {
  title: string
  text?: string
  loading?: boolean
  withBack?: boolean
  children?: ReactNode
}

function Notice({ title, text, loading = false, withBack = false, children }: NoticeProps) {
  return (
    <div className="page page--center game-notice">
      <Crewmate className={`game-notice__crewmate ${loading ? 'is-loading' : ''}`} />
      <h1 className="title">{title}</h1>
      {text && <p className="muted">{text}</p>}
      {children}
      {withBack && (
        <Link to="/jogatina" className="button button--block">
          {copy.back}
        </Link>
      )}
    </div>
  )
}
