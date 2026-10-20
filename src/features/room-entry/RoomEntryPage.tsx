import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { describeError } from '@/content/errors'
import { roomEntryContent as copy } from '@/content/roomEntry'
import { getRoomRepository, normalizeRoomCode, rememberedRoomCode, ROOM_CODE_LENGTH } from '@/data/rooms'
import { Crewmate } from '@/shared/components/Crewmate'
import { BackIcon } from '@/shared/components/Icons'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'
import './roomEntry.css'

export function RoomEntryPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [notFound, setNotFound] = useState(false)
  const joining = useAsyncAction(describeError)
  const creating = useAsyncAction(describeError)
  const lastRoom = rememberedRoomCode()

  async function join(event: FormEvent) {
    event.preventDefault()
    const normalized = normalizeRoomCode(code)
    if (normalized.length !== ROOM_CODE_LENGTH) return
    setNotFound(false)
    await joining.run(async () => {
      if (await (await getRoomRepository()).exists(normalized)) navigate(`/sala/${normalized}`)
      else setNotFound(true)
    })
  }

  function create() {
    creating.run(async () => navigate(`/sala/${await (await getRoomRepository()).create()}`))
  }

  return (
    <div className="page room-entry">
      <Link to="/" className="back-link">
        <BackIcon /> {copy.back}
      </Link>

      <header className="page-header room-entry__header">
        <Crewmate className="room-entry__crewmate" />
        <p className="label">{copy.kicker}</p>
        <h1 className="display">{copy.title}</h1>
        <p className="muted">{copy.intro}</p>
      </header>

      {lastRoom && (
        <Link to={`/sala/${lastRoom}`} className="button button--block">
          {copy.rejoin(lastRoom)}
        </Link>
      )}

      <form className="card stack" onSubmit={join}>
        <label htmlFor="room-code" className="field-label center">
          {copy.codeLabel}
        </label>
        <input
          id="room-code"
          className="input input--code"
          value={code}
          onChange={(event) => {
            setCode(normalizeRoomCode(event.target.value))
            setNotFound(false)
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={ROOM_CODE_LENGTH}
          placeholder="ABCD"
        />
        {notFound && <p className="error center">{copy.notFound}</p>}
        {joining.error && <p className="error center">{joining.error}</p>}
        <button
          type="submit"
          className="button button--primary button--block"
          disabled={code.length !== ROOM_CODE_LENGTH || joining.pending}
        >
          {joining.pending ? copy.checking : copy.join}
        </button>
      </form>

      <p className="divider">{copy.or}</p>

      <button type="button" className="button button--block" disabled={creating.pending} onClick={create}>
        {creating.pending ? copy.creating : copy.create}
      </button>
      {creating.error && <p className="error center">{creating.error}</p>}

      <ul className="room-entry__how muted small">
        {copy.howItWorks.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
