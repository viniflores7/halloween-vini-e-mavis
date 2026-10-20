import { useState } from 'react'
import { roundContent as copy } from '@/content/round'
import type { Role } from '@/data/rooms'

interface HoldToSeeRoleProps {
  role: Role
  partnerNames: string[]
}

export function HoldToSeeRole({ role, partnerNames }: HoldToSeeRoleProps) {
  const [visible, setVisible] = useState(false)
  const hide = () => setVisible(false)

  return (
    <button
      type="button"
      className={`hold-role ${visible ? `hold-role--${role}` : ''}`}
      onPointerDown={() => setVisible(true)}
      onPointerUp={hide}
      onPointerLeave={hide}
      onPointerCancel={hide}
      onKeyDown={(event) => event.key === ' ' && setVisible(true)}
      onKeyUp={hide}
      onBlur={hide}
      onContextMenu={(event) => event.preventDefault()}
    >
      {visible ? (
        <>
          <span className="hold-role__role">{role === 'impostor' ? copy.impostor : copy.crewmate}</span>
          {partnerNames.length > 0 && <span className="small">{copy.partners(partnerNames.join(', '))}</span>}
        </>
      ) : (
        copy.holdToSeeRole
      )}
    </button>
  )
}
