import { roundContent as copy } from '@/content/round'
import type { Role } from '@/data/rooms'
import { Crewmate } from '@/shared/components/Crewmate'
import { Overlay } from '@/shared/components/Overlay'

interface RoleRevealProps {
  role: Role
  partnerNames: string[]
  secondsLeft: number
}

export function RoleReveal({ role, partnerNames, secondsLeft }: RoleRevealProps) {
  const impostor = role === 'impostor'

  return (
    <Overlay>
      <div className={`reveal reveal--${role}`} role="alert">
        <p className="reveal__hush">{copy.revealHush}</p>
        <p className="label reveal__you-are">{copy.youAre}</p>
        <p className="display reveal__role">{impostor ? copy.impostor : copy.crewmate}</p>
        <Crewmate color={impostor ? '#8e1b1b' : '#d8cfbd'} className="reveal__crewmate" />
        <p className="reveal__goal">{impostor ? copy.impostorGoal : copy.crewmateGoal}</p>
        {partnerNames.length > 0 && <p className="reveal__partners">{copy.partners(partnerNames.join(', '))}</p>}
        <p className="label reveal__countdown">{copy.startsIn(secondsLeft)}</p>
      </div>
    </Overlay>
  )
}
