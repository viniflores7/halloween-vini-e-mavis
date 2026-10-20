import type { ReactNode } from 'react'
import type { Player } from '@/data/realtime'
import { Avatar } from '@/shared/components/Avatar'
import './contestReveal.css'

export interface VoteRow {
  voter: Player
  choices: { badge: ReactNode; name: string }[] | null
}

interface VoteBreakdownProps {
  title: string
  rows: VoteRow[]
  emptyLabel: string
}

export function VoteBreakdown({ title, rows, emptyLabel }: VoteBreakdownProps) {
  return (
    <section className="breakdown">
      <h2 className="label breakdown__title">{title}</h2>
      <ul className="breakdown__rows">
        {rows.map(({ voter, choices }) => (
          <li key={voter.id} className="breakdown__row">
            <Avatar player={voter} size="sm" />
            <div className="breakdown__body">
              <p className="breakdown__voter">{voter.name}</p>
              {choices ? (
                <ul className="breakdown__choices">
                  {choices.map((choice, index) => (
                    <li key={index}>
                      {choice.badge}
                      <span>{choice.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small">{emptyLabel}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
