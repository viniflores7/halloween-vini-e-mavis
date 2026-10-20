import { useState, type FormEvent } from 'react'
import { describeError } from '@/content/errors'
import { playerSetupContent as copy } from '@/content/playerSetup'
import { MAX_NAME_LENGTH, type PlayerProfile } from '@/data/realtime'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import { CameraCapture } from './CameraCapture'
import './playerSetup.css'

interface PlayerSetupProps {
  initial?: PlayerProfile
  photoRequired?: boolean
  onSubmit: (profile: PlayerProfile) => Promise<unknown>
  onCancel?: () => void
}

export function PlayerSetup({ initial, photoRequired = false, onSubmit, onCancel }: PlayerSetupProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [photo, setPhoto] = useState(initial?.photo ?? '')
  const [missing, setMissing] = useState<'name' | 'photo' | null>(null)
  const [allowWithoutPhoto, setAllowWithoutPhoto] = useState(false)
  const saving = useAsyncAction(describeError)
  const editing = Boolean(initial)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return setMissing('name')
    if (!photo && !allowWithoutPhoto) return setMissing('photo')
    setMissing(null)
    saving.run(() => onSubmit({ name, photo }))
  }

  return (
    <form className="page player-setup" onSubmit={submit}>
      <h1 className="title center">{editing ? copy.editTitle : copy.joinTitle}</h1>

      <div>
        <label htmlFor="player-name" className="field-label">
          {copy.nameLabel}
        </label>
        <input
          id="player-name"
          className="input"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          enterKeyHint="done"
          placeholder={copy.namePlaceholder}
          onChange={(event) => setName(event.target.value)}
        />
        {missing === 'name' && <p className="error">{copy.needsName}</p>}
      </div>

      <div>
        <p className="field-label">{copy.photoLabel}</p>
        <CameraCapture photo={photo} onChange={setPhoto} />
        {missing === 'photo' && (
          <p className="error center">
            {copy.needsPhoto}{' '}
            {!photoRequired && (
              <button type="button" className="link" onClick={() => setAllowWithoutPhoto(true)}>
                {copy.joinWithoutPhoto}
              </button>
            )}
          </p>
        )}
      </div>

      {saving.error && <p className="error center">{saving.error}</p>}
      <button type="submit" className="button button--primary button--block" disabled={saving.pending}>
        {saving.pending ? copy.saving : editing ? copy.save : copy.join}
      </button>
      {onCancel && (
        <button type="button" className="button button--block" onClick={onCancel}>
          {copy.cancel}
        </button>
      )}
    </form>
  )
}
