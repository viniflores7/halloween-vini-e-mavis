import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { roomGateContent as copy } from '@/content/roomGate'
import {
  findPlayer,
  playersInOrder,
  rememberRoomCode,
  type LiveSnapshot,
  type Player,
  type PlayerProfile,
  type RoomKind,
} from '@/data/realtime'
import { PlayerSetup } from '@/features/player-setup'
import { Notice } from '@/shared/components/Notice'
import './roomGate.css'

interface RoomDoc {
  code: string
  playerIds: string[]
}

export interface RoomInside<T> {
  doc: T
  players: Player[]
  me: Player
  myId: string
}

interface RoomGateProps<T extends RoomDoc> {
  connection: { myId: string | null; snapshot: LiveSnapshot<T> | null; failed: boolean }
  kind: RoomKind
  backTo: string
  max: number
  isOpen: (doc: T) => boolean
  closedText: string
  photoRequired?: boolean
  editingProfile: boolean
  onProfileSaved: () => void
  join: (profile: PlayerProfile) => Promise<void>
  children: (inside: RoomInside<T>) => ReactNode
}

export function RoomGate<T extends RoomDoc>({
  connection: { myId, snapshot, failed },
  kind,
  backTo,
  max,
  isOpen,
  closedText,
  photoRequired = false,
  editingProfile,
  onProfileSaved,
  join,
  children,
}: RoomGateProps<T>) {
  const doc = snapshot?.doc ?? null
  const players = doc && snapshot ? playersInOrder(doc.playerIds, snapshot.players) : []
  const me = findPlayer(players, myId)

  useEffect(() => {
    if (me && doc) rememberRoomCode(kind, doc.code)
  }, [me, doc, kind])

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

  const back = (
    <Link to={backTo} className="button button--block">
      {copy.back}
    </Link>
  )

  if (!doc) {
    return (
      <Notice title={copy.notFoundTitle} text={copy.notFoundText}>
        {back}
      </Notice>
    )
  }

  if (!me || editingProfile) {
    const inside = doc.playerIds.includes(myId)
    if (!inside && !isOpen(doc)) return <Notice title={copy.closedTitle} text={closedText} loading />
    if (!inside && doc.playerIds.length >= max) {
      return (
        <Notice title={copy.fullTitle} text={copy.fullText(max)}>
          {back}
        </Notice>
      )
    }

    const save = async (profile: PlayerProfile) => {
      await join(profile)
      onProfileSaved()
    }
    return (
      <PlayerSetup
        initial={editingProfile && me ? me : undefined}
        photoRequired={photoRequired}
        onSubmit={save}
        onCancel={editingProfile ? onProfileSaved : undefined}
      />
    )
  }

  return (
    <>
      {failed && <p className="offline-banner">{copy.connectionError}</p>}
      {children({ doc, players, me, myId })}
    </>
  )
}
