import type { ReactNode } from 'react'
import { Crewmate } from './Crewmate'
import './Notice.css'

interface NoticeProps {
  title: string
  text?: string
  loading?: boolean
  children?: ReactNode
}

export function Notice({ title, text, loading = false, children }: NoticeProps) {
  return (
    <div className="page page--center notice">
      <Crewmate className={`notice__crewmate ${loading ? 'is-loading' : ''}`} />
      <h1 className="title">{title}</h1>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  )
}
