import { amongUsEntryContent } from '@/content/roomEntry'
import { getRoomRepository } from '@/data/rooms'
import { Crewmate } from '@/shared/components/Crewmate'
import { RoomEntry } from './RoomEntry'

export function AmongUsEntryPage() {
  return (
    <RoomEntry
      copy={amongUsEntryContent}
      kind="amongUs"
      path="sala"
      illustration={<Crewmate className="room-entry__illustration" />}
      loadRepository={getRoomRepository}
    />
  )
}
