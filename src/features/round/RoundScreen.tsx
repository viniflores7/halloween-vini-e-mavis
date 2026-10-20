import { useState } from 'react'
import { describeError } from '@/content/errors'
import { roundContent as copy } from '@/content/round'
import {
  alivePlayerIds,
  elapsedPlayMs,
  emergencyMeetingsLeft,
  getRoomRepository,
  impostorIds,
  isHost,
  roleOf,
  type MeetingKind,
  type Player,
  type Room,
} from '@/data/rooms'
import { Avatar } from '@/shared/components/Avatar'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmergencyIcon, ReportIcon, SkullIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import { HoldToSeeRole } from './HoldToSeeRole'
import { ReportDialog } from './ReportDialog'
import { RoleReveal } from './RoleReveal'
import { RoundTimer } from './RoundTimer'
import './round.css'

interface RoundScreenProps {
  room: Room
  players: Player[]
  myId: string
  now: number
}

type Dialog = 'emergency' | 'report' | 'end' | null

export function RoundScreen({ room, players, myId, now }: RoundScreenProps) {
  const round = room.round!
  const [dialog, setDialog] = useState<Dialog>(null)
  const action = useAsyncAction(describeError)
  const alive = alivePlayerIds(room)
  const amAlive = alive.includes(myId)
  const role = roleOf(room, myId) ?? 'crewmate'
  const partnerNames =
    role === 'impostor'
      ? players.filter((player) => player.id !== myId && impostorIds(room).includes(player.id)).map((p) => p.name)
      : []
  const emergenciesLeft = emergencyMeetingsLeft(room, myId)

  if (now < round.startsAt) {
    return <RoleReveal role={role} partnerNames={partnerNames} secondsLeft={Math.ceil((round.startsAt - now) / 1000)} />
  }

  function open(next: Dialog) {
    action.clearError()
    setDialog(next)
  }

  async function callMeeting(kind: MeetingKind, victimId?: string) {
    const called = await action.run(async () => (await getRoomRepository()).callMeeting(room.code, kind, victimId))
    if (called) setDialog(null)
  }

  async function endRound() {
    const ended = await action.run(async () => (await getRoomRepository()).backToLobby(room.code))
    if (ended) setDialog(null)
  }

  return (
    <div className="page round">
      <header className="round__top">
        <span className="label">{copy.round(round.number)}</span>
        <span className="badge">{copy.alive(alive.length, Object.keys(round.roles).length)}</span>
      </header>

      {!amAlive && (
        <div className="round__dead card">
          <SkullIcon width={32} />
          <div>
            <p className="label">{copy.deadTitle}</p>
            <p className="small">{copy.deadText}</p>
          </div>
        </div>
      )}

      <RoundTimer elapsedMs={elapsedPlayMs(round, now)} />

      {amAlive && (
        <div className="round__actions">
          <button
            type="button"
            className="action-tile action-tile--emergency"
            disabled={emergenciesLeft === 0}
            onClick={() => open('emergency')}
          >
            <EmergencyIcon className="action-tile__icon" />
            <span className="action-tile__label">{copy.emergency}</span>
            <span className="action-tile__hint">
              {emergenciesLeft > 0 ? copy.emergencyLeft(emergenciesLeft) : copy.emergencyNone}
            </span>
          </button>
          <button type="button" className="action-tile" onClick={() => open('report')}>
            <ReportIcon className="action-tile__icon" />
            <span className="action-tile__label">{copy.report}</span>
          </button>
        </div>
      )}

      <HoldToSeeRole role={role} partnerNames={partnerNames} />

      <ul className="round__players">
        {players.map((player) => (
          <li key={player.id}>
            <Avatar player={player} size="sm" dead={!alive.includes(player.id)} />
            <span>{player.name}</span>
          </li>
        ))}
      </ul>

      {isHost(room, myId) && (
        <button type="button" className="link round__end" onClick={() => open('end')}>
          {copy.endRound}
        </button>
      )}

      <ConfirmDialog
        open={dialog === 'emergency'}
        title={copy.emergencyConfirmTitle}
        confirmLabel={copy.emergencyConfirm}
        cancelLabel={copy.cancel}
        pending={action.pending}
        error={action.error}
        onConfirm={() => callMeeting('emergency')}
        onCancel={() => setDialog(null)}
      >
        <p className="center muted">{copy.emergencyConfirmText}</p>
      </ConfirmDialog>

      <ReportDialog
        open={dialog === 'report'}
        candidates={players.filter((player) => player.id !== myId && alive.includes(player.id))}
        pending={action.pending}
        error={action.error}
        onReport={(victimId) => callMeeting('report', victimId)}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'end'}
        title={copy.endRoundTitle}
        confirmLabel={copy.endRoundConfirm}
        cancelLabel={copy.cancel}
        pending={action.pending}
        error={action.error}
        onConfirm={endRound}
        onCancel={() => setDialog(null)}
      >
        <p className="center muted">{copy.endRoundText}</p>
      </ConfirmDialog>
    </div>
  )
}
