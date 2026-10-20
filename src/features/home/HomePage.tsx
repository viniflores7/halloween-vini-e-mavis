import { Link } from 'react-router'
import { homeContent as copy } from '@/content/home'
import { party } from '@/content/party'
import { Crewmate } from '@/shared/components/Crewmate'
import './home.css'

export function HomePage() {
  return (
    <div className="page page--center home">
      <header className="home__invite">
        <p className="label home__summons">{party.summons}</p>
        <p className="title home__edition">{party.edition}</p>
        <h1 className="display home__name">{party.name}</h1>
        <p className="title home__hosts">{party.hosts}</p>
        <p className="label home__month">{party.month}</p>
        <div className="home__date">
          <span className="label home__date-item">{party.day}</span>
          <Crewmate className="home__crewmate" />
          <span className="label home__date-item">{party.time}</span>
        </div>
        <p className="label blood home__dress">{party.dressCode}</p>
      </header>

      <nav className="home__options">
        <Link to="/concurso" className="button button--block">
          {copy.costumeContest}
        </Link>
        <Link to="/jogatina" className="button button--primary button--block">
          {copy.amongUs}
        </Link>
      </nav>
    </div>
  )
}
