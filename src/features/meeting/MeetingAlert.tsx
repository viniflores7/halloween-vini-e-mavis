import { meetingContent as copy } from '@/content/meeting'
import type { Meeting, Player } from '@/data/rooms'
import { Avatar } from '@/shared/components/Avatar'
import { EmergencyIcon, ReportIcon } from '@/shared/components/Icons'
import { Overlay } from '@/shared/components/Overlay'

interface MeetingAlertProps {
  meeting: Meeting
  caller: Player | null
  victim: Player | null
}

export function MeetingAlert({ meeting, caller, victim }: MeetingAlertProps) {
  const report = meeting.kind === 'report'

  return (
    <Overlay>
      <div className="meeting-alert" role="alert">
        {report ? <ReportIcon className="meeting-alert__icon" /> : <EmergencyIcon className="meeting-alert__icon" />}
        <p className="display meeting-alert__title">{report ? copy.reportAlert : copy.emergencyAlert}</p>
        <div className="meeting-alert__people">
          <Avatar player={caller} size="xl" />
          {victim && <Avatar player={victim} size="xl" dead />}
        </div>
        <p className="meeting-alert__text">
          {report ? copy.reportedBy(caller?.name ?? '?', victim?.name ?? '?') : copy.calledBy(caller?.name ?? '?')}
        </p>
      </div>
    </Overlay>
  )
}
