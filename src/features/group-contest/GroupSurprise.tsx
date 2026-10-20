import { groupContestContent as copy } from '@/content/groupContest'
import { Confetti } from '@/shared/components/Confetti'
import { Crewmate } from '@/shared/components/Crewmate'
import { Overlay } from '@/shared/components/Overlay'

export function GroupSurprise() {
  return (
    <Overlay>
      <div className="spotlight surprise" role="alert">
        <p className="display surprise__word">{copy.surprise}</p>
        <div className="surprise__duo" aria-hidden="true">
          <Crewmate className="surprise__crewmate" />
          <Crewmate color="#8e1b1b" className="surprise__crewmate" />
          <Crewmate color="#d8cfbd" className="surprise__crewmate" />
        </div>
        <p className="title surprise__title">{copy.surpriseTitle}</p>
        <p className="surprise__text">{copy.surpriseText}</p>
      </div>
      <Confetti count={90} />
    </Overlay>
  )
}
