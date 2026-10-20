import { Link } from 'react-router'
import { costumeContestContent as copy } from '@/content/costumeContest'
import { Crewmate } from '@/shared/components/Crewmate'
import { BackIcon } from '@/shared/components/Icons'
import './costumeContest.css'

export function CostumeContestPage() {
  return (
    <div className="page costume-contest">
      <Link to="/" className="back-link">
        <BackIcon /> {copy.back}
      </Link>
      <div className="costume-contest__body">
        <h1 className="title">{copy.title}</h1>
        <Crewmate className="costume-contest__crewmate" />
        <p className="display costume-contest__soon">{copy.soon}</p>
        <p className="muted">{copy.text}</p>
      </div>
    </div>
  )
}
