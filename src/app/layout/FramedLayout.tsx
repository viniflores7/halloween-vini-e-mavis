import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { layoutContent as copy } from '@/content/layout'
import { isDemoMode } from '@/data/firebase'
import './FramedLayout.css'

export function FramedLayout() {
  const scrollRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="framed">
      <main ref={scrollRef} className="framed__scroll" id="conteudo">
        {isDemoMode && <p className="demo-banner">{copy.demoBanner}</p>}
        <div className="framed__content">
          <Outlet />
        </div>
      </main>
      <div className="framed__border" aria-hidden="true" />
    </div>
  )
}
