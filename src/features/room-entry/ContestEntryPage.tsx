import { contestEntryContent } from '@/content/roomEntry'
import { getContestRepository } from '@/data/contests'
import { TrophyIcon } from '@/shared/components/Icons'
import { RoomEntry } from './RoomEntry'

export function ContestEntryPage() {
  return (
    <RoomEntry
      copy={contestEntryContent}
      kind="contest"
      path="concurso"
      illustration={<TrophyIcon className="room-entry__illustration" />}
      loadRepository={getContestRepository}
    />
  )
}
