import { useEffect, useRef, useState } from 'react'
import { describeError } from '@/content/errors'
import { lobbyContent as copy } from '@/content/lobby'
import { getRoomRepository, maxImpostors, SETTINGS_LIMITS, type Room, type RoomSettings } from '@/data/rooms'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

const SAVE_DELAY_MS = 450

interface LobbySettingsProps {
  room: Room
  editable: boolean
}

type NumericSetting = keyof typeof SETTINGS_LIMITS

const formatVoting = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export function LobbySettings({ room, editable }: LobbySettingsProps) {
  const [draft, setDraft] = useState(room.settings)
  const dirty = useRef(false)
  const saving = useAsyncAction(describeError)
  const { run } = saving
  const impostorLimit = maxImpostors(room.playerIds.length)

  useEffect(() => {
    if (!dirty.current) setDraft(room.settings)
  }, [room.settings])

  useEffect(() => {
    if (!dirty.current) return
    const id = window.setTimeout(() => {
      dirty.current = false
      run(async () => (await getRoomRepository()).updateSettings(room.code, draft))
    }, SAVE_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [draft, room.code, run])

  function change(next: Partial<RoomSettings>) {
    dirty.current = true
    setDraft((current) => ({ ...current, ...next }))
  }

  const stepper = (key: NumericSetting, label: string, display: string) => (
    <SettingStepper
      label={label}
      display={display}
      editable={editable}
      canDecrease={draft[key] > SETTINGS_LIMITS[key].min}
      canIncrease={draft[key] < SETTINGS_LIMITS[key].max}
      onStep={(direction) => change({ [key]: draft[key] + direction * SETTINGS_LIMITS[key].step })}
    />
  )

  return (
    <section className="card settings">
      <h2 className="label settings__title">{copy.rules}</h2>
      {stepper('impostorCount', copy.impostorCount, String(draft.impostorCount))}
      {draft.impostorCount > impostorLimit && (
        <p className="settings__hint muted small">{copy.impostorLimit(room.playerIds.length, impostorLimit)}</p>
      )}
      {stepper('emergencyMeetingsPerPlayer', copy.emergencyMeetings, String(draft.emergencyMeetingsPerPlayer))}
      {stepper('votingSeconds', copy.votingSeconds, formatVoting(draft.votingSeconds))}
      <p className="settings__note muted small">{copy.roundLength}</p>
      {saving.error && <p className="error small">{saving.error}</p>}
    </section>
  )
}

interface SettingStepperProps {
  label: string
  display: string
  editable: boolean
  canDecrease: boolean
  canIncrease: boolean
  onStep: (direction: 1 | -1) => void
}

function SettingStepper({ label, display, editable, canDecrease, canIncrease, onStep }: SettingStepperProps) {
  return (
    <div className="setting">
      <span className="setting__label">{label}</span>
      <div className="stepper">
        {editable && (
          <button
            type="button"
            className="stepper__button"
            aria-label={copy.decrease(label)}
            disabled={!canDecrease}
            onClick={() => onStep(-1)}
          >
            −
          </button>
        )}
        <span className="stepper__value" aria-live="polite">
          {display}
        </span>
        {editable && (
          <button
            type="button"
            className="stepper__button"
            aria-label={copy.increase(label)}
            disabled={!canIncrease}
            onClick={() => onStep(1)}
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}
