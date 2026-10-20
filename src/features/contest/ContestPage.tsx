import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { contestContent as copy } from '@/content/contest'
import { getContestRepository, MAX_PARTICIPANTS, type Contest } from '@/data/contests'
import { normalizeRoomCode } from '@/data/realtime'
import { CostumePodium, CostumeResults } from '@/features/contest-reveal'
import { CostumeVoting } from '@/features/costume-voting'
import { GroupPodium, GroupResults, GroupSetup, GroupVoting } from '@/features/group-contest'
import { RoomGate } from '@/features/room-gate'
import { useLiveSnapshot } from '@/shared/hooks/useLiveSnapshot'
import { useNow } from '@/shared/hooks/useNow'
import { useWakeLock } from '@/shared/hooks/useWakeLock'
import { ContestLobby } from './ContestLobby'
import './contest.css'

const TICK_MS = 250

export function ContestPage() {
  const { code: rawCode = '' } = useParams()
  const code = normalizeRoomCode(rawCode)
  if (code !== rawCode) return <Navigate to={`/concurso/${code}`} replace />
  return <ContestRoom key={code} code={code} />
}

function ContestRoom({ code }: { code: string }) {
  const connection = useLiveSnapshot(getContestRepository, code)
  const now = useNow(connection.repository?.now ?? Date.now, TICK_MS)
  const [editingProfile, setEditingProfile] = useState(false)
  const stage = connection.snapshot?.doc?.stage

  useWakeLock(Boolean(stage && stage !== 'lobby'))

  return (
    <RoomGate<Contest>
      connection={connection}
      kind="contest"
      backTo="/concurso"
      max={MAX_PARTICIPANTS}
      isOpen={(contest) => contest.stage === 'lobby'}
      closedText={copy.closedText}
      photoRequired
      editingProfile={editingProfile}
      onProfileSaved={() => setEditingProfile(false)}
      join={async (profile) => (await getContestRepository()).join(code, profile)}
    >
      {({ doc: contest, players, myId }) => {
        const props = { contest, players, myId, now }
        switch (contest.stage) {
          case 'lobby':
            return (
              <ContestLobby
                contest={contest}
                players={players}
                myId={myId}
                onEditProfile={() => setEditingProfile(true)}
              />
            )
          case 'voting':
            return <CostumeVoting {...props} />
          case 'podium':
            return <CostumePodium {...props} />
          case 'results':
            return <CostumeResults contest={contest} players={players} myId={myId} />
          case 'duoSetup':
            return <GroupSetup {...props} />
          case 'duoVoting':
            return <GroupVoting {...props} />
          case 'duoPodium':
            return <GroupPodium {...props} />
          case 'duoResults':
            return <GroupResults contest={contest} players={players} />
        }
      }}
    </RoomGate>
  )
}
